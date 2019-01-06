import { VineApp, VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { AnyType, IterableOfType } from 'gs-types/export';
import { Observable } from 'rxjs';
import { BaseComponentSpec, ComponentSpec, OnCreateSpec, OutputSpec, RendererSpec } from './component-spec';
import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';

interface FullComponentSpec extends ComponentSpec, BaseComponentSpec { }

type ContextWithShadowRoot = BaseDisposable & {[SHADOW_ROOT]?: ShadowRoot};

/**
 * Sets up the environment for Persona. Handles registrations of custom elements.
 */
export class PersonaBuilder {
  private readonly registeredComponentSpecs_: Map<string, FullComponentSpec> = new Map();

  constructor(
      private readonly baseCustomElementAnnotationsCache_: Annotations<BaseComponentSpec>,
      private readonly customElementAnnotationsCache_: Annotations<ComponentSpec>,
  ) { }

  build(
      rootTags: string[],
      customElementRegistry: CustomElementRegistry,
      vine: VineImpl): void {
    for (const spec of this.registeredComponentSpecs_.values()) {
      const outputs = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .filterItem((item): item is OutputSpec => !!item.output);

      const template = spec.template;
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          ImmutableSet.of(spec.onCreate || []),
          outputs,
          template,
          vine);

      customElementRegistry.define(spec.tag, elementClass);
    }
  }

  getComponentSpec(tag: string): ComponentSpec|null {
    return this.registeredComponentSpecs_.get(tag) || null;
  }

  /**
   * @TODO This should only take in one root ctrl.
   */
  register(
      rootCtrls: Array<typeof CustomElementCtrl>,
      {builder, vineOut}: VineApp): void {
    for (const ctrl of rootCtrls) {
      const baseComponentSpec = getSpec_(this.baseCustomElementAnnotationsCache_, ctrl);
      const componentSpec = getSpec_(this.customElementAnnotationsCache_, ctrl);
      if (this.registeredComponentSpecs_.has(componentSpec.tag)) {
        throw Errors.assert(`Component with tag ${componentSpec.tag}`)
            .shouldBe('unregistered')
            .butNot();
      }

      this.registeredComponentSpecs_.set(
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
  }
}

export function getSpec_<T extends BaseComponentSpec|ComponentSpec>(
    annotationsCache: Annotations<T>,
    ctrl: typeof CustomElementCtrl,
): T {
  const annotations = annotationsCache
      .forCtor(ctrl)
      .getAttachedValues()
      .get(__class);
  if (!annotations) {
    throw Errors.assert(`Annotations for ${ctrl.name}`).shouldExist().butNot();
  }

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
    componentClass: new () => CustomElementCtrl,
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
