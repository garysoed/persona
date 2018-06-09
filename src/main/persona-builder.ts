import { VineBuilder, VineImpl } from 'grapevine/export/main';
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
    vine: VineImpl,
    shadowMode: 'open'|'closed' = 'closed'): typeof HTMLElement {
  return class extends HTMLElement {
    private readonly customElementImpl_: CustomElementImpl = new CustomElementImpl(
        componentClass,
        this,
        rendererLocators,
        templateStr,
        watchers,
        vine,
        shadowMode);

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
          vine,
          spec.shadowMode);
      customElementRegistry.define(spec.tag, elementClass);
    }
  }

  register(
      tag: string,
      templateKey: string,
      componentClass: typeof BaseDisposable,
      renderers: ImmutableSet<RendererSpec>,
      watchers: ImmutableSet<ResolvedLocator<any>>,
      vineBuilder: VineBuilder,
      shadowMode: 'open'|'closed' = 'closed'): void {
    if (this.componentSpecs_.has(tag)) {
      throw Errors.assert(`Component with tag ${tag}`).shouldBe('unregistered').butNot();
    }

    for (const renderer of renderers || []) {
      renderer.locator.setupVine(vineBuilder);
      vineBuilder.source(renderer.locator.getSourceId(), null);
    }

    for (const watcher of watchers || []) {
      vineBuilder.source(watcher.getSourceId(), null);
    }

    this.componentSpecs_.set(tag, {
      componentClass,
      renderers,
      shadowMode,
      tag,
      templateKey,
      watchers,
    });
  }
}
