import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { ResolvedLocator, ResolvedRenderableLocator } from '../locator/locator';
import { Watcher } from '../watcher/watcher';
import { ComponentSpec, RendererSpec } from './component-spec';
import { CustomElementImpl } from './custom-element-impl';
import { TemplateRegistrar } from './template-registrar';

function createCustomElementClass_(
    componentClass: typeof BaseDisposable,
    rendererLocators: ImmutableSet<ResolvedRenderableLocator<any>>,
    templateStr: string,
    watchers: ImmutableSet<Watcher<any>>,
    vine: VineImpl): typeof HTMLElement {
  return class extends HTMLElement {
    private readonly customElementImpl_: CustomElementImpl = new CustomElementImpl(
        componentClass,
        this,
        rendererLocators,
        templateStr,
        watchers,
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

  constructor(private readonly templateRegistrar_: TemplateRegistrar) { }

  build(customElementRegistry: CustomElementRegistry, vine: VineImpl): void {
    for (const spec of this.componentSpecs_.values()) {
      const watchers = ImmutableSet.of(spec.watchers || [])
          .mapItem(locator => locator.createWatcher(vine));
      const rendererLocators = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .mapItem(renderer => renderer.locator);

      const template = this.templateRegistrar_.getTemplate(spec.templateKey);
      if (!template) {
        throw Errors.assert(`Template of ${spec.templateKey}`).shouldExist().butNot();
      }

      const elementClass = createCustomElementClass_(
          spec.componentClass,
          rendererLocators,
          template,
          watchers,
          vine);
      customElementRegistry.define(spec.tag, elementClass);
    }
  }

  register(
      tag: string,
      templateKey: string,
      componentClass: typeof BaseDisposable,
      renderers: ImmutableSet<RendererSpec>,
      sources: ImmutableSet<InstanceSourceId<any>>,
      watchers: ImmutableSet<ResolvedLocator<any>>): void {
    if (this.componentSpecs_.has(tag)) {
      throw Errors.assert(`Component with tag ${tag}`).shouldBe('unregistered').butNot();
    }

    this.componentSpecs_.set(tag, {
      componentClass,
      renderers,
      sources,
      tag,
      templateKey,
      watchers,
    });
  }
}
