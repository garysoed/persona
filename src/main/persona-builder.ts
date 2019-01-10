import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableList, ImmutableSet } from 'gs-tools/export/collect';
import { __class, ClassAnnotation, PropertyAnnotation } from 'gs-tools/export/data';
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


type ContextWithShadowRoot = BaseDisposable & {[SHADOW_ROOT]?: ShadowRoot};

/**
 * Sets up the environment for Persona. Handles registrations of custom elements.
 */
export class PersonaBuilder {

  constructor(
      private readonly baseCustomElementAnnotation: ClassAnnotation<BaseCustomElementSpec, any>,
      private readonly customElementAnnotation: ClassAnnotation<FullComponentData, any>,
      private readonly onCreateAnnotation: PropertyAnnotation<OnCreateHandler, any>,
      private readonly renderPropertyAnnotation: PropertyAnnotation<OnCreateHandler, any>,
      private readonly renderWithForwardingAnnotation: ClassAnnotation<OnCreateHandler, any>,
  ) { }

  build(
      rootCtrls: CustomElementCtrlCtor[],
      customElementRegistry: CustomElementRegistry,
      vineBuilder: VineBuilder,
  ): {vine: VineImpl} {
    const registeredComponentSpecs = this.register(new Set(rootCtrls), vineBuilder);
    const vine = vineBuilder.run();
    for (const spec of registeredComponentSpecs.values()) {
      const template = spec.template;
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          ImmutableSet.of(spec.onCreate || []),
          template,
          vine,
      );

      customElementRegistry.define(spec.tag, elementClass);
    }

    return {vine};
  }

  // TODO: Combine annotations.
  private getOnCreateHandlers(ctor: CustomElementCtrlCtor): ImmutableSet<OnCreateHandler> {
    return this.onCreateAnnotation.getAttachedValuesForCtor(ctor)
        .entries()
        .mapItem(([key, entries]) => entries.getAt(0))
        .filterItem((item): item is [Object, OnCreateHandler] => !!item)
        .mapItem(([_, renderData]) => renderData);
  }

  private getRenderPropertyOnCreateHandlers(
      ctor: CustomElementCtrlCtor,
  ): ImmutableSet<OnCreateHandler> {
    return this.renderPropertyAnnotation.getAttachedValuesForCtor(ctor)
        .entries()
        .mapItem(([key, entries]) => entries.getAt(0))
        .filterItem((item): item is [Object, OnCreateHandler] => !!item)
        .mapItem(([_, renderData]) => renderData);
  }

  private getRenderWithForwardingOnCreateHandlers(
      ctor: CustomElementCtrlCtor,
  ): ImmutableSet<OnCreateHandler> {
    return ImmutableSet.of(
        this.renderWithForwardingAnnotation.getAttachedValues(ctor)
            .mapItem(([, handler]) => handler),
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
    annotation: ClassAnnotation<T, [any]>,
    ctrl: typeof CustomElementCtrl,
): T {
  return getSpec_(
      annotation.getAttachedValues(ctrl).mapItem(([, data]) => data),
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
