import {Vine} from 'grapevine';
import {$asArray, $asMap, $asSet, $filter, $filterDefined, $flat, $map, $pipe} from 'gs-tools/export/collect';
import {ClassAnnotation, ClassAnnotator} from 'gs-tools/export/data';
import {iterableOfType, unknownType} from 'gs-types';
import {BehaviorSubject, combineLatest, EMPTY, merge, of as observableOf, Subject, timer} from 'rxjs';
import {distinctUntilChanged, mapTo, shareReplay, switchMap, tap} from 'rxjs/operators';

import {UnresolvedAttributeInput} from '../input/attribute';
import {UnresolvedHasAttributeInput} from '../input/has-attribute';
import {UnresolvedSpec} from '../main/api';
import {BaseCustomElementSpec, CustomElementSpec} from '../types/element-spec';

import {BaseCtrlCtor} from './base-ctrl';
import {CustomElementClass, __customElementImplFactory as __decoratorFactory} from './custom-element-class';
import {CustomElementDecorator} from './custom-element-decorator';
import {TemplateService} from './template-service';


const CLEANUP_DELAY_MS = 1000;

export interface Config {
  readonly customElementRegistry: CustomElementRegistry;
  readonly rootCtrls: ReadonlyArray<BaseCtrlCtor<{}>>;
  readonly rootDoc: Document;
  readonly vine: Vine;
}

export interface AttributeChangedEvent {
  readonly attrName: string;
  readonly newValue: string;
  readonly oldValue: string;
}


interface FullComponentData extends CustomElementSpec {
  readonly componentClass: BaseCtrlCtor<{}>;
}

interface RegistrationSpec {
  readonly componentClass: BaseCtrlCtor<{}>;
  readonly api: UnresolvedSpec;
  readonly tag: string;
  readonly template: string;
}

export class Builder {
  private readonly baseCustomElementAnnotator = new ClassAnnotator(
      (_target: unknown, spec: BaseCustomElementSpec) => ({
        data: {
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  private readonly customElementAnnotator = new ClassAnnotator(
      (target: unknown, spec: CustomElementSpec) => ({
        data: {
          componentClass: target as BaseCtrlCtor<{}>,
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  baseCustomElement(spec: BaseCustomElementSpec): ClassDecorator {
    return this.baseCustomElementAnnotator.decorator(spec);
  }

  build(config: Config): void {
    const customElementAnnotation = this.customElementAnnotator.data;
    const ctrls = getAllCtrls(config.rootCtrls, customElementAnnotation);
    const registeredComponentSpecs = this.register(new Set(ctrls));

    const templatesMap = $pipe(
        registeredComponentSpecs,
        $map(([, {tag, template}]) => {
          return [tag, template] as [string, string];
        }),
        $asMap(),
    );
    const templateService = new TemplateService(templatesMap, config.rootDoc);

    runConfigures(customElementAnnotation, ctrls, config.vine);

    [...registeredComponentSpecs.values()]
        .map(async ({api, componentClass, tag}) => {
          const observedAttributes = $pipe(
              Object.keys(api),
              $map(key => api[key]),
              $filter((spec): spec is UnresolvedAttributeInput<unknown> => {
                return spec instanceof UnresolvedAttributeInput
                    || spec instanceof UnresolvedHasAttributeInput;
              }),
              $map(({attrName}) => attrName),
              $asArray(),
          );

          const elementClass = createCustomElementClass(
              componentClass,
              observedAttributes,
              tag,
              templateService,
              config.vine,
          );

          return new Promise<void>(resolve => {
            config.customElementRegistry.define(tag, elementClass);
            resolve();
          });
        });
  }

  customElement(spec: CustomElementSpec): ClassDecorator {
    return this.customElementAnnotator.decorator(spec);
  }

  getSpec(ctrl: BaseCtrlCtor<{}>): CustomElementSpec|null {
    return getSpecFromClassAnnotation(this.customElementAnnotator, ctrl);
  }

  private register(
      rootCtrls: ReadonlySet<BaseCtrlCtor<{}>>,
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
    componentClass: BaseCtrlCtor<{}>,
    observedAttributes: readonly string[],
    tag: string,
    templateService: TemplateService,
    vine: Vine,
): CustomElementClass {
  const decoratorFactory = (element: HTMLElement, shadowMode: 'open'|'closed'): CustomElementDecorator => {
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
        shareReplay({bufferSize: 1, refCount: false}),
    );

    private readonly isConnected$ = new BehaviorSubject(false);
    private readonly onAttributeChanged$ = new Subject<AttributeChangedEvent>();

    constructor() {
      super();
      this.run();
    }

    attributeChangedCallback(attrName: string, oldValue: string, newValue: string): void {
      this.onAttributeChanged$.next({attrName, oldValue, newValue});
    }

    connectedCallback(): void {
      this.isConnected$.next(true);
    }

    disconnectedCallback(): void {
      this.isConnected$.next(false);
    }

    private run(): void {
      const isConnected$ = this.isConnected$.pipe(
          switchMap(isConnected => {
            return isConnected ? observableOf(true) : timer(CLEANUP_DELAY_MS).pipe(mapTo(false));
          }),
          distinctUntilChanged(),
      );

      combineLatest([this.decorator$, isConnected$])
          .pipe(
              switchMap(([decorator, isConnected]) => {
                if (!isConnected) {
                  return EMPTY;
                }

                const onRun$ = decorator.run();
                const onAttributeChanged$ = this.onAttributeChanged$.pipe(
                    tap(({attrName}) => {
                      decorator.attributeChangedCallback(attrName);
                    }),
                );

                return merge(onRun$, onAttributeChanged$);
              }),
          )
          .subscribe();
    }

    static get observedAttributes(): readonly string[] {
      return observedAttributes;
    }
  };

  // tslint:disable-next-line:prefer-object-spread
  return Object.assign(htmlClass, {[__decoratorFactory]: decoratorFactory});
}

function getAllCtrls(
    rootCtrls: ReadonlyArray<BaseCtrlCtor<{}>>,
    customElementAnnotation: ClassAnnotation<FullComponentData>,
): ReadonlySet<BaseCtrlCtor<{}>> {
  const ctrls = new Set(rootCtrls);
  for (const checkedCtrl of ctrls) {
    const additionalCtors = $pipe(
        customElementAnnotation.getAttachedValues(checkedCtrl),
        $map(([, value]) => value),
        $flat<FullComponentData>(),
        $map(data => data.dependencies),
        $filterDefined(),
        $flat<BaseCtrlCtor<{}>>(),
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
    ctrl: BaseCtrlCtor<{}>,
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
    ctrl: BaseCtrlCtor<{}>,
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
      if (!iterableOfType(unknownType).check(value)
          || !iterableOfType(unknownType).check(normalizedExistingValue)) {
        // Ignore the new value, since it belongs to the ancestor class.
        continue;
      }

      combinedSpec[key] = [...normalizedExistingValue, ...value] as unknown as T[keyof T];
    }
  }

  if (!combinedSpec) {
    throw new Error(`Annotations for ${ctrl.name} is missing`);
  }

  return combinedSpec;
}

function runConfigures(
    customElementAnnotation: ClassAnnotation<FullComponentData>,
    // eslint-disable-next-line @typescript-eslint/ban-types
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
