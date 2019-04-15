import { Source, Vine, VineBuilder } from '@grapevine';
import { DelayedObservable } from '@grapevine/internal';
import { $declareFinite, $filter, $filterNotEqual, $flat, $getKey, $head, $map, $pick, $pipe, asImmutableList, asImmutableSet, createImmutableSet, ImmutableList, ImmutableSet } from '@gs-tools/collect';
import { ClassAnnotation, ClassAnnotator, PropertyAnnotator } from '@gs-tools/data';
import { Errors } from '@gs-tools/error';
import { debug } from '@gs-tools/rxjs';
import { AnyType, IterableOfType } from '@gs-types';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Input } from '../component/input';
import { Output } from '../component/output';
import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl } from './custom-element-impl';
import { RenderBuilder } from './render-builder';
import { BaseCustomElementSpec, CustomElementCtrlCtor, CustomElementSpec, InitFn } from './types';

interface FullComponentData extends CustomElementSpec {
  componentClass: CustomElementCtrlCtor;
}

interface RegistrationSpec {
  componentClass: CustomElementCtrlCtor;
  tag: string;
  template: string;
}

export class Builder {
  private readonly baseCustomElementAnnotator = new ClassAnnotator(
      (target: Function, spec: BaseCustomElementSpec) => ({
        data: {
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  private readonly customElementAnnotator = new ClassAnnotator(
      (target: Function, spec: CustomElementSpec) => ({
        data: {
          componentClass: target as CustomElementCtrlCtor,
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  constructor(private readonly vineBuilder: VineBuilder) { }

  baseCustomElement(spec: BaseCustomElementSpec): ClassDecorator {
    return this.baseCustomElementAnnotator.decorator(spec);
  }

  build(
      appName: string,
      rootCtrls: CustomElementCtrlCtor[],
      customElementRegistry: CustomElementRegistry,
  ): {vine: Vine} {
    const customElementAnnotation = this.customElementAnnotator.data;
    const ctrls = getAllCtrls(rootCtrls, customElementAnnotation);
    const registeredComponentSpecs = this.register(new Set(ctrls));

    const vine = this.vineBuilder.build(`${appName}-vine`);

    runConfigures(customElementAnnotation, ctrls, vine);

    [...registeredComponentSpecs.values()]
        .map(async spec => {
          const template = spec.template;
          const elementClass = createCustomElementClass_(
              spec.componentClass,
              template,
              vine,
          );

          return new Promise(resolve => {
            customElementRegistry.define(spec.tag, elementClass);
            resolve();
          });
        });

    return {vine};
  }

  customElement(spec: CustomElementSpec): ClassDecorator {
    return this.customElementAnnotator.decorator(spec);
  }

  input<T>(input: Input<T>, context: CustomElementCtrl): DelayedObservable<T> {
    return this.vineBuilder
        .stream<T, CustomElementCtrl>(
            function(this: CustomElementCtrl): Observable<T> {
              // TODO: This subject should be customized for each input.
              const subject = new ReplaySubject<T>(1);
              this.addSubscription(input.getValue(this.shadowRoot).subscribe(subject));

              return subject;
            },
            context,
        )
        .asObservable();
  }

  private register(
      rootCtrls: Set<CustomElementCtrlCtor>,
  ): Map<string, RegistrationSpec> {
    const registeredComponentSpecs = new Map<string, RegistrationSpec>();

    for (const ctrl of rootCtrls) {
      const componentSpec = getSpecFromClassAnnotation(this.customElementAnnotator, ctrl);

      registeredComponentSpecs.set(
          componentSpec.tag,
          {
            componentClass: componentSpec.componentClass,
            tag: componentSpec.tag,
            template: componentSpec.template,
          },
      );
    }

    return registeredComponentSpecs;
  }

  render<T>(...outputs: Array<Output<T>>): RenderBuilder<T> {
    return new RenderBuilder(outputs);
  }
}

function createCustomElementClass_(
    componentClass: CustomElementCtrlCtor,
    templateStr: string,
    vine: Vine,
): CustomElementClass {
  const customElementImplFactory = (element: HTMLElement, shadowMode: 'open'|'closed') => {
    return new CustomElementImpl(
        componentClass,
        element,
        templateStr,
        vine,
        shadowMode);
  };
  const htmlClass = class extends HTMLElement {
    private readonly customElementImpl_: CustomElementImpl =
        customElementImplFactory(this, 'closed');

    constructor() {
      super();
    }

    async connectedCallback(): Promise<void> {
      return this.customElementImpl_.connectedCallback();
    }

    disconnectedCallback(): void {
      this.customElementImpl_.disconnectedCallback();
    }
  };

  // tslint:disable-next-line:prefer-object-spread
  return Object.assign(htmlClass, {[__customElementImplFactory]: customElementImplFactory});
}

function getAllCtrls(
    rootCtrls: CustomElementCtrlCtor[],
    customElementAnnotation: ClassAnnotation<FullComponentData>,
): ImmutableSet<CustomElementCtrlCtor> {
  const ctrls = new Set(rootCtrls);
  for (const checkedCtrl of ctrls) {
    const additionalCtors = $pipe(
        customElementAnnotation.getAttachedValues(checkedCtrl),
        $pick(1),
        $flat<FullComponentData>(),
        $map(data => data.dependencies),
        $filterNotEqual(undefined),
        $flat<CustomElementCtrlCtor>(),
        $declareFinite(),
        asImmutableSet(),
    );

    for (const additionalCtor of additionalCtors) {
      if (!ctrls.has(additionalCtor)) {
        ctrls.add(additionalCtor);
      }
    }
  }

  return createImmutableSet(ctrls);
}

function getSpecFromClassAnnotation<T extends CustomElementSpec|BaseCustomElementSpec>(
    annotation: ClassAnnotator<T, [any]>,
    ctrl: typeof CustomElementCtrl,
): T {
  return getSpec_(
      $pipe(
          annotation.data.getAttachedValues(ctrl),
          $map(([, dataList]) => $pipe(dataList, $head())),
          // Only take the first item
          $filter((data): data is T => !!data),
          asImmutableList(),
      ),
      ctrl,
  );
}

export function getSpec_<T extends CustomElementSpec|BaseCustomElementSpec>(
    annotations: ImmutableList<T>,
    ctrl: typeof CustomElementCtrl,
): T {
  let combinedSpec: T|null = null;
  for (const spec of annotations) {
    if (!combinedSpec) {
      combinedSpec = spec;
      continue;
    }

    for (const key of Object.keys(spec) as Array<keyof T>) {
      const value = spec[key];
      const existingValue = combinedSpec[key];
      // tslint:disable-next-line: strict-type-predicates
      const normalizedExistingValue = existingValue === undefined ? [] : existingValue;
      if (!IterableOfType(AnyType()).check(value) ||
          !IterableOfType(AnyType()).check(normalizedExistingValue)) {
        // Ignore the new value, since it belongs to the ancestor class.
        continue;
      }

      combinedSpec[key] = [...normalizedExistingValue, ...value] as unknown as T[keyof T];
    }
  }

  if (!combinedSpec) {
    throw Errors.assert(`Annotations for ${ctrl.name}`).shouldExist().butNot();
  }

  return combinedSpec;
}

function runConfigures(
    customElementAnnotation: ClassAnnotation<FullComponentData>,
    ctrls: ImmutableSet<Function>,
    vine: Vine,
): void {
  const configureList = $pipe(
      customElementAnnotation.getAllValues(),
      $getKey(...ctrls),
      $pick(1),
      $flat<FullComponentData>(),
      $map(({configure}) => configure),
      $filterNotEqual(undefined),
      $declareFinite(),
      asImmutableList(),
  );

  for (const configure of configureList) {
    configure(vine);
  }
}
