import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { ResolvedRenderableLocator } from '../locator/locator';
import { ComponentSpec, RendererSpec } from './component-spec';
import { CustomElementImpl } from './custom-element-impl';

function createCustomElementClass_(
    componentClass: typeof BaseDisposable,
    rendererLocators: ImmutableSet<ResolvedRenderableLocator<any>>,
    templateStr: string,
    vine: VineImpl): typeof HTMLElement {
  return class extends HTMLElement {
    private readonly customElementImpl_: CustomElementImpl = new CustomElementImpl(
        componentClass,
        this,
        rendererLocators,
        templateStr,
        vine);

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
}

/**
 * Sets up the environment for Persona. Handles registrations of custom elements.
 */
export class PersonaBuilder {
  private readonly componentSpecs_: Map<string, ComponentSpec> = new Map();

  build(customElementRegistry: CustomElementRegistry, vine: VineImpl): void {
    for (const spec of this.componentSpecs_.values()) {
      const rendererLocators = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .mapItem(renderer => renderer.locator);
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          rendererLocators,
          'TODO',
          vine);
      customElementRegistry.define(spec.tag, elementClass);
    }
  }

  register(
      tag: string,
      templateKey: string,
      componentClass: typeof BaseDisposable,
      renderers: ImmutableSet<RendererSpec>,
      sources: ImmutableSet<InstanceSourceId<any>>): void {
    if (this.componentSpecs_.has(tag)) {
      throw Errors.assert(`Component with tag ${tag}`).shouldBe('unregistered').butNot();
    }

    this.componentSpecs_.set(tag, {
      componentClass,
      renderers,
      sources,
      tag,
      templateKey,
    });
  }
}
