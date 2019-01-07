import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableList, ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations, ClassAnnotation } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { AnyType, IterableOfType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { BaseCustomElement } from '../annotation/base-custom-element';
import { BaseComponentSpec, OnCreateSpec, OutputSpec, RendererSpec } from './component-spec';
import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';

export type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

interface CustomElementData {
  componentClass: CustomElementCtrlCtor;
  tag: string;
  template: string;
}
export interface FullComponentSpec extends CustomElementData, BaseComponentSpec { }

type ContextWithShadowRoot = BaseDisposable & {[SHADOW_ROOT]?: ShadowRoot};

/**
 * Sets up the environment for Persona. Handles registrations of custom elements.
 */
export class PersonaBuilder {

  constructor(
      private readonly baseCustomElementAnnotationsCache_: Annotations<BaseComponentSpec>,
      private readonly baseCustomElement: BaseCustomElement,
      private readonly customElementAnnotation: ClassAnnotation<FullComponentSpec, [any]>,
  ) { }

  build(
      rootCtrls: CustomElementCtrlCtor[],
      customElementRegistry: CustomElementRegistry,
      vineBuilder: VineBuilder,
  ): {vine: VineImpl} {
    const registeredComponentSpecs = this.register(new Set(rootCtrls), vineBuilder);
    const vine = vineBuilder.run();
    for (const spec of registeredComponentSpecs.values()) {
      const outputs = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .filterItem((item): item is OutputSpec => !!item.output);

      const template = spec.template;
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          ImmutableSet.of(spec.onCreate || []),
          outputs,
          template,
          vine,
      );

      customElementRegistry.define(spec.tag, elementClass);
    }

    return {vine};
  }

  private register(
      rootCtrls: Set<CustomElementCtrlCtor>,
      builder: VineBuilder,
  ): Map<string, FullComponentSpec> {
    const registeredComponentSpecs = new Map<string, FullComponentSpec>();

    for (const ctrl of rootCtrls) {
      const componentSpec = getSpecFromClassAnnotation(this.customElementAnnotation, ctrl);
      this.baseCustomElement(componentSpec)(ctrl);

      const baseComponentSpec = getSpecFromBaseAnnotation(
          this.baseCustomElementAnnotationsCache_,
          ctrl,
      );

      registeredComponentSpecs.set(
          componentSpec.tag,
          {...baseComponentSpec, ...componentSpec},
      );

      for (const input of baseComponentSpec.input || []) {
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

function getSpecFromBaseAnnotation<T extends BaseComponentSpec>(
    cache: Annotations<T>,
    ctrl: typeof CustomElementCtrl,
): T {
  const annotations = cache
      .forCtor(ctrl)
      .getAttachedValues()
      .get(__class);
  if (!annotations) {
    throw Errors.assert(`Annotations for ${ctrl.name}`).shouldExist().butNot();
  }

  return getSpec_(annotations, ctrl);
}

function getSpecFromClassAnnotation<T extends CustomElementData>(
    annotation: ClassAnnotation<T, [any]>,
    ctrl: typeof CustomElementCtrl,
): T {
  return getSpec_(
      annotation.getAttachedValues(ctrl).mapItem(([, data]) => data),
      ctrl,
  );
}

export function getSpec_<T extends BaseComponentSpec|CustomElementData>(
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
    onCreate: ImmutableSet<OnCreateSpec>,
    outputs: ImmutableSet<OutputSpec>,
    templateStr: string,
    vine: VineImpl,
): CustomElementClass {
  const customElementImplFactory = (element: HTMLElement, shadowMode: 'open'|'closed') => {
    return new CustomElementImpl(
        componentClass,
        element,
        onCreate,
        outputs,
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
