import { NodeId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { $exec, $filter, $head, $map, $scan, $tail, asImmutableList, asImmutableSet, createImmutableSet, ImmutableList, ImmutableSet } from 'gs-tools/export/collect';
import { ClassAnnotator, ParameterAnnotator, PropertyAnnotator } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { AnyType, IterableOfType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { OnCreateHandler } from './component-spec';
import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';
import { BaseCustomElementSpec, CustomElementSpec } from './persona';

export type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

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
  id: NodeId<unknown>;
  index: number;
  key: string|symbol;
  target: Object;
}

type ContextWithShadowRoot = BaseDisposable & {[SHADOW_ROOT]?: ShadowRoot};

/**
 * Sets up the environment for Persona. Handles registrations of custom elements.
 */
export class PersonaBuilder {

  constructor(
      private readonly baseCustomElementAnnotation: ClassAnnotator<BaseCustomElementSpec, any>,
      private readonly customElementAnnotation: ClassAnnotator<FullComponentData, any>,
      private readonly inputAnnotator: ParameterAnnotator<InputData, any>,
      private readonly onCreateAnnotation: PropertyAnnotator<OnCreateHandler, any>,
      private readonly renderPropertyAnnotation: PropertyAnnotator<OnCreateHandler, any>,
      private readonly renderWithForwardingAnnotation: ClassAnnotator<OnCreateHandler, any>,
  ) { }

  build(
      rootCtrls: CustomElementCtrlCtor[],
      customElementRegistry: CustomElementRegistry,
      vineBuilder: VineBuilder,
  ): {vine: VineImpl} {
    const registeredComponentSpecs = this.register(new Set(rootCtrls), vineBuilder);
    const vine = vineBuilder.run(rootCtrls);
    for (const spec of registeredComponentSpecs.values()) {
      const template = spec.template;
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          createImmutableSet(spec.onCreate || []),
          template,
          vine,
      );

      customElementRegistry.define(spec.tag, elementClass);
    }

    return {vine};
  }

  // TODO: Combine annotations.
  private getOnCreateHandlers(ctor: CustomElementCtrlCtor): ImmutableSet<OnCreateHandler> {
    return $exec(
        this.onCreateAnnotation.data.getAttachedValuesForCtor(ctor),
        // Get the implementation in the descendant class
        $map(([_, entries]) => $exec(entries, $head())),
        $filter((item): item is [Object, ImmutableList<OnCreateHandler>] => !!item),
        // Get the first annotation
        $map(([_, renderDataList]) => $exec(renderDataList, $head())),
        $filter((renderData): renderData is OnCreateHandler => !!renderData),
        asImmutableSet(),
    );
  }

  private getRenderPropertyOnCreateHandlers(
      ctor: CustomElementCtrlCtor,
  ): ImmutableSet<OnCreateHandler> {
    return $exec(
        this.renderPropertyAnnotation.data.getAttachedValuesForCtor(ctor),
        // Get the implementation in the descendant class
        $map(([_, entries]) => $exec(entries, $head())),
        $filter((item): item is [Object, ImmutableList<OnCreateHandler>] => !!item),
        // Get the first annotation
        $map(([_, renderDataList]) => $exec(renderDataList, $head())),
        $filter((renderData): renderData is OnCreateHandler => !!renderData),
        asImmutableSet(),
    );
  }

  private getRenderWithForwardingOnCreateHandlers(
      ctor: CustomElementCtrlCtor,
  ): ImmutableSet<OnCreateHandler> {
    return createImmutableSet(
        $exec(
            this.renderWithForwardingAnnotation.data.getAttachedValues(ctor),
            $map(([, handler]) => handler),
            $scan((prev, item) => [...prev, ...item], [] as OnCreateHandler[]),
            $tail(),
        ),
    );
  }

  private register(
      rootCtrls: Set<CustomElementCtrlCtor>,
      builder: VineBuilder,
  ): Map<string, RegistrationSpec> {
    const registeredComponentSpecs = new Map<string, RegistrationSpec>();

    for (const ctrl of rootCtrls) {
      const componentSpec = getSpecFromClassAnnotation(this.customElementAnnotation, ctrl);
      const baseComponentSpec = getSpecFromClassAnnotation(this.baseCustomElementAnnotation, ctrl);

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

      const inputs = new Set([
        ...(componentSpec.input || []),
        ...(baseComponentSpec.input || []),
      ]);
      for (const input of inputs) {
        if (builder.isRegistered(input.id)) {
          continue;
        }

        builder.stream(input.id, function(this: ContextWithShadowRoot): Observable<unknown> {
          const shadowRoot = this[SHADOW_ROOT];
          if (!shadowRoot) {
            throw Errors.assert(`Shadow root of ${this}`).shouldExist().butNot();
          }

          return input.getValue(shadowRoot);
        });
      }
    }

    return registeredComponentSpecs;
  }
}

function getSpecFromClassAnnotation<T extends CustomElementSpec|BaseCustomElementSpec>(
    annotation: ClassAnnotator<T, [any]>,
    ctrl: typeof CustomElementCtrl,
): T {
  return getSpec_(
      $exec(
          annotation.data.getAttachedValues(ctrl),
          $map(([, dataList]) => $exec(dataList, $head())),
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
