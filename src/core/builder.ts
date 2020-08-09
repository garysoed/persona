import { Vine, VineBuilder } from 'grapevine';
import { $asArray, $asMap, $asSet, $filter, $filterDefined, $flat, $map, $pipe } from 'gs-tools/export/collect';
import { ClassAnnotation, ClassAnnotator } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/export/error';
import { iterableOfType, unknownType } from 'gs-types';
import { merge, of as observableOf, Subject, timer } from 'rxjs';
import { share, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHasAttributeInput } from '../input/has-attribute';
import { UnconvertedSpec } from '../main/api';
import { CustomElementCtrl, CustomElementCtrlCtor } from '../types/custom-element-ctrl';
import { BaseCustomElementSpec, CustomElementSpec } from '../types/element-spec';

import { __customElementImplFactory as __decoratorFactory, CustomElementClass } from './custom-element-class';
import { CustomElementDecorator } from './custom-element-decorator';
import { TemplateService } from './template-service';


export interface AttributeChangedEvent {
  readonly attrName: string;
  readonly newValue: string;
  readonly oldValue: string;
}


interface FullComponentData extends CustomElementSpec {
  readonly componentClass: CustomElementCtrlCtor;
}

interface RegistrationSpec {
  readonly componentClass: CustomElementCtrlCtor;
  readonly api: UnconvertedSpec;
  readonly tag: string;
  readonly template: string;
}

export class Builder {
  private readonly baseCustomElementAnnotator = new ClassAnnotator(
      (_target: Function, spec: BaseCustomElementSpec) => ({
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
      rootDoc: Document,
      customElementRegistry: CustomElementRegistry,
  ): {vine: Vine} {
    const customElementAnnotation = this.customElementAnnotator.data;
    const ctrls = getAllCtrls(rootCtrls, customElementAnnotation);
    const registeredComponentSpecs = this.register(new Set(ctrls));

    const templatesMap = $pipe(
        registeredComponentSpecs,
        $map(([, {tag, template}]) => {
          return [tag, template] as [string, string];
        }),
        $asMap(),
    );
    const templateService = new TemplateService(templatesMap, rootDoc);

    const vine = this.vineBuilder.build(`${appName}-vine`);

    runConfigures(customElementAnnotation, ctrls, vine);

    [...registeredComponentSpecs.values()]
        .map(async ({api, componentClass, tag}) => {
          const observedAttributes = $pipe(
              Object.keys(api),
              $map(key => api[key]),
              $filter((spec): spec is UnresolvedAttributeInput<unknown> => {
                return spec instanceof UnresolvedAttributeInput ||
                    spec instanceof UnresolvedHasAttributeInput;
              }),
              $map(({attrName}) => attrName),
              $asArray(),
          );

          const elementClass = createCustomElementClass(
              componentClass,
              observedAttributes,
              tag,
              templateService,
              vine,
          );

          return new Promise(resolve => {
            customElementRegistry.define(tag, elementClass);
            resolve();
          });
        });

    return {vine};
  }

  customElement(spec: CustomElementSpec): ClassDecorator {
    return this.customElementAnnotator.decorator(spec);
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
            api: componentSpec.api || {},
            componentClass: componentSpec.componentClass,
            tag: componentSpec.tag,
            template: componentSpec.template,
          },
      );
    }

    return registeredComponentSpecs;
  }
}

function createCustomElementClass(
    componentClass: CustomElementCtrlCtor,
    observedAttributes: readonly string[],
    tag: string,
    templateService: TemplateService,
    vine: Vine,
): CustomElementClass {
  const decoratorFactory = (element: HTMLElement, shadowMode: 'open'|'closed') => {
    return new CustomElementDecorator(
        componentClass,
        element,
        tag,
        templateService,
        vine,
        shadowMode,
    );
  };
  const htmlClass = class extends HTMLElement {
    private readonly decorator$ = timer(0).pipe(
        switchMap(() => {
          return observableOf(decoratorFactory(this, 'closed'));
        }),
        share(),
    );

    private readonly onAttributeChanged$ = new Subject<AttributeChangedEvent>();
    private readonly onDisconnect$ = new Subject<void>();

    constructor() {
      super();
    }

    attributeChangedCallback(attrName: string, oldValue: string, newValue: string): void {
      this.onAttributeChanged$.next({attrName, oldValue, newValue});
    }

    connectedCallback(): void {
      this.decorator$.pipe(
          take(1),
          switchMap(decorator => {
            const onRun$ = decorator.run();
            const onAttributeChanged$ = this.onAttributeChanged$.pipe(
                tap(({attrName, oldValue, newValue}) => {
                  decorator.attributeChangedCallback(attrName, oldValue, newValue);
                }),
            );

            return merge(onRun$, onAttributeChanged$);
          }),
          takeUntil(this.onDisconnect$),
      ).subscribe();
    }

    disconnectedCallback(): void {
      this.onDisconnect$.next(undefined);
    }

    static get observedAttributes(): readonly string[] {
      return observedAttributes;
    }
  };

  // tslint:disable-next-line:prefer-object-spread
  return Object.assign(htmlClass, {[__decoratorFactory]: decoratorFactory});
}

function getAllCtrls(
    rootCtrls: CustomElementCtrlCtor[],
    customElementAnnotation: ClassAnnotation<FullComponentData>,
): ReadonlySet<CustomElementCtrlCtor> {
  const ctrls = new Set(rootCtrls);
  for (const checkedCtrl of ctrls) {
    const additionalCtors = $pipe(
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
      $pipe(
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
  const configures = $pipe(
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
