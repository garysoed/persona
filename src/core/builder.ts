import { Vine, VineBuilder } from '@grapevine';
import { DelayedObservable } from '@grapevine/internal';
import { $, $asArray, $asSet, $filter, $filterDefined, $flat, $map } from '@gs-tools/collect';
import { ClassAnnotation, ClassAnnotator } from '@gs-tools/data';
import { Errors } from '@gs-tools/error';
import { iterableOfType, unknownType } from '@gs-types';
import { Observable } from '@rxjs';

import { CustomElementCtrl, CustomElementCtrlCtor } from '../types/custom-element-ctrl';
import { BaseCustomElementSpec, CustomElementSpec } from '../types/element-spec';
import { Input } from '../types/input';
import { Output } from '../types/output';

import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementImpl } from './custom-element-impl';
import { RenderBuilder } from './render-builder';


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
              return input.getValue(this.shadowRoot);
            },
            context,
        )
        .asObservable();
  }

  render<T>(...outputs: Array<Output<T>>): RenderBuilder<T> {
    return new RenderBuilder(outputs);
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
): ReadonlySet<CustomElementCtrlCtor> {
  const ctrls = new Set(rootCtrls);
  for (const checkedCtrl of ctrls) {
    const additionalCtors = $(
        customElementAnnotation.getAttachedValues(checkedCtrl),
        $map(([, value]) => value),
        $flat<FullComponentData>(),
        $map(data => data.dependencies),
        $filterDefined(),
        $flat<CustomElementCtrlCtor>(),
        $asSet(),
    );

    for (const additionalCtor of additionalCtors) {
      if (!ctrls.has(additionalCtor)) {
        ctrls.add(additionalCtor);
      }
    }
  }

  return ctrls;
}

function getSpecFromClassAnnotation<T extends CustomElementSpec|BaseCustomElementSpec>(
    annotation: ClassAnnotator<T, [any]>,
    ctrl: typeof CustomElementCtrl,
): T {
  return getSpec_(
      $(
          annotation.data.getAttachedValues(ctrl),
          // Only take the first item
          $map(([, dataList]) => dataList[0]),
          $filter((data): data is T => !!data),
          $asArray(),
      ),
      ctrl,
  );
}

export function getSpec_<T extends CustomElementSpec|BaseCustomElementSpec>(
    annotations: readonly T[],
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
      if (!iterableOfType(unknownType).check(value) ||
          !iterableOfType(unknownType).check(normalizedExistingValue)) {
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
    ctrls: ReadonlySet<Function>,
    vine: Vine,
): void {
  const configures = $(
      customElementAnnotation.getAllValues(),
      $filter(([key]) => ctrls.has(key)),
      $map(([, value]) => value),
      $flat<FullComponentData>(),
      $map(({configure}) => configure),
      $filterDefined(),
  );

  for (const configure of configures) {
    configure(vine);
  }
}
