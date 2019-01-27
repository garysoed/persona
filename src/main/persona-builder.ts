import { NodeId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { $declareFinite, $filter, $filterNotEqual, $flat, $getKey, $head, $map, $pick, $pipe, $scan, $tail, asImmutableList, asImmutableSet, createImmutableSet, ImmutableList, ImmutableMap, ImmutableSet } from 'gs-tools/export/collect';
import { ClassAnnotation, ClassAnnotator, ParameterAnnotation, ParameterAnnotator, PropertyAnnotator } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { AnyType, IterableOfType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { Input } from '../component/input';
import { OnCreateHandler } from './component-spec';
import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';
import { BaseCustomElementSpec, CustomElementCtrlCtor, CustomElementSpec } from './persona';

export interface FullComponentData extends CustomElementSpec {
  componentClass: CustomElementCtrlCtor;
}

interface RegistrationSpec {
  componentClass: CustomElementCtrlCtor;
  onCreate: OnCreateHandler[];
  tag: string;
  template: string;
}

interface InputData {
  index: number;
  input: Input<unknown>;
  key: string|symbol;
  target: Object;
}

type ContextWithShadowRoot = BaseDisposable & {[SHADOW_ROOT]?: ShadowRoot};

/**
 * Sets up the environment for Persona. Handles registrations of custom elements.
 */
export class PersonaBuilder {

  constructor(
      private readonly customElementAnnotator: ClassAnnotator<FullComponentData, any>,
      private readonly inputAnnotator: ParameterAnnotator<InputData, any>,
      private readonly onCreateAnnotation: PropertyAnnotator<OnCreateHandler, any>,
      private readonly renderPropertyAnnotation: PropertyAnnotator<OnCreateHandler, any>,
      private readonly renderWithForwardingAnnotation: ClassAnnotator<OnCreateHandler, any>,
      private readonly vineInDecorator: (id: NodeId<unknown>) => ParameterDecorator,
  ) { }

  build(
      rootCtrls: CustomElementCtrlCtor[],
      customElementRegistry: CustomElementRegistry,
      vineBuilder: VineBuilder,
  ): {vine: VineImpl} {
    const customElementAnnotation = this.customElementAnnotator.data;
    const ctrls = getAllCtrls(rootCtrls, customElementAnnotation);
    const inputDataSet = getInputDataSet(this.inputAnnotator.data);
    addInputsAsVineIn(inputDataSet, this.vineInDecorator);
    const registeredComponentSpecs = this.register(new Set(ctrls));
    registerInputs(inputDataSet, vineBuilder);

    const vine = vineBuilder.run([...ctrls]);
    runConfigures(customElementAnnotation, ctrls, vine);

    [...registeredComponentSpecs.values()]
        .map(spec => {
          const template = spec.template;
          const elementClass = createCustomElementClass_(
              spec.componentClass,
              createImmutableSet(spec.onCreate || []),
              template,
              vine,
          );

          const msg = `creating ${spec.tag}`;

          return new Promise(resolve => {
            window.setTimeout(() => {
              console.time(msg);
              customElementRegistry.define(spec.tag, elementClass);
              console.timeEnd(msg);
              resolve();
            });
          });
        });

    return {vine};
  }

  // TODO: Combine annotations.
  private getOnCreateHandlers(ctor: CustomElementCtrlCtor): ImmutableSet<OnCreateHandler> {
    return $pipe(
        this.onCreateAnnotation.data.getAttachedValuesForCtor(ctor),
        // Get the implementation in the descendant class
        $map(([_, entries]) => $pipe(entries, $head())),
        $filter((item): item is [Object, ImmutableList<OnCreateHandler>] => !!item),
        // Get the first annotation
        $map(([_, renderDataList]) => $pipe(renderDataList, $head())),
        $filter((renderData): renderData is OnCreateHandler => !!renderData),
        asImmutableSet(),
    );
  }

  private getRenderPropertyOnCreateHandlers(
      ctor: CustomElementCtrlCtor,
  ): ImmutableSet<OnCreateHandler> {
    return $pipe(
        this.renderPropertyAnnotation.data.getAttachedValuesForCtor(ctor),
        // Get the implementation in the descendant class
        $map(([_, entries]) => $pipe(entries, $head())),
        $filter((item): item is [Object, ImmutableList<OnCreateHandler>] => !!item),
        // Get the first annotation
        $map(([_, renderDataList]) => $pipe(renderDataList, $head())),
        $filter((renderData): renderData is OnCreateHandler => !!renderData),
        asImmutableSet(),
    );
  }

  private getRenderWithForwardingOnCreateHandlers(
      ctor: CustomElementCtrlCtor,
  ): ImmutableSet<OnCreateHandler> {
    return $pipe(
        this.renderWithForwardingAnnotation.data.getAttachedValues(ctor),
        $pick(1),
        $flat<OnCreateHandler>(),
        $declareFinite(),
        asImmutableSet(),
    );
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
            onCreate: [
              ...this.getOnCreateHandlers(ctrl),
              ...this.getRenderPropertyOnCreateHandlers(ctrl),
              ...this.getRenderWithForwardingOnCreateHandlers(ctrl),
            ],
            tag: componentSpec.tag,
            template: componentSpec.template,
          },
      );
    }

    return registeredComponentSpecs;
  }
}

function addInputsAsVineIn(
    inputDataSet: ImmutableSet<InputData>,
    vineInDecorator: (id: NodeId<unknown>) => ParameterDecorator,
): void {
  for (const {index, input, key, target} of inputDataSet) {
    vineInDecorator(input.id)(target, key, index);
  }
}

function getInputDataSet(
    inputAnnotation: ParameterAnnotation<InputData>,
): ImmutableSet<InputData> {
  return $pipe(
      inputAnnotation.getAllValues(),
      $pick(1),
      $flat<[string|symbol, ImmutableMap<number, ImmutableList<InputData>>]>(),
      $pick(1),
      $flat<[number, ImmutableList<InputData>]>(),
      $pick(1),
      $flat<InputData>(),
      $declareFinite(),
      asImmutableSet(),
  );
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

function createCustomElementClass_(
    componentClass: CustomElementCtrlCtor,
    onCreate: ImmutableSet<OnCreateHandler>,
    templateStr: string,
    vine: VineImpl,
): CustomElementClass {
  const customElementImplFactory = (element: HTMLElement, shadowMode: 'open'|'closed') => {
    return new CustomElementImpl(
        componentClass,
        element,
        onCreate,
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

    connectedCallback(): void {
      this.customElementImpl_.connectedCallback();
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

function registerInputs(
    inputDataSet: ImmutableSet<InputData>,
    vineBuilder: VineBuilder,
): void {
  const inputs: ImmutableSet<Input<unknown>> = $pipe(
      inputDataSet,
      $map(({input}) => input),
      asImmutableSet(),
  );

  for (const input of inputs) {
    const inputId = input.id;
    if (vineBuilder.isRegistered(inputId)) {
      continue;
    }

    vineBuilder.stream(inputId, function(this: ContextWithShadowRoot): Observable<unknown> {
      const shadowRoot = this[SHADOW_ROOT];
      if (!shadowRoot) {
        throw Errors.assert(`Shadow root of ${this}`).shouldExist().butNot();
      }

      return input.getValue(shadowRoot);
    });
  }
}

function runConfigures(
    customElementAnnotation: ClassAnnotation<FullComponentData>,
    ctrls: ImmutableSet<Function>,
    vine: VineImpl,
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
