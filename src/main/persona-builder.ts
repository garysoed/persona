import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { Errors } from 'gs-tools/export/error';
import { ResolvedLocator, ResolvedRenderableLocator } from '../locator/locator';
import { Watcher } from '../watcher/watcher';
import { ComponentSpec, RendererSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';

function createCustomElementClass_(
    componentClass: new () => CustomElementCtrl,
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

  build(customElementRegistry: CustomElementRegistry, vine: VineImpl): void {
    for (const spec of this.componentSpecs_.values()) {
      const watchers = ImmutableSet.of(spec.watchers || [])
          .mapItem(locator => locator.createWatcher(vine));
      const rendererLocators = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .mapItem(renderer => renderer.locator);

      const template = spec.template;
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
      template: string,
      componentClass: new () => CustomElementCtrl,
      renderers: ImmutableSet<RendererSpec>,
      watchers: ImmutableSet<ResolvedLocator<any>>,
      vineBuilder: VineBuilder,
      shadowMode: 'open'|'closed' = 'closed',
      windowObj: Window = window): void {
    if (this.componentSpecs_.has(tag)) {
      throw Errors.assert(`Component with tag ${tag}`).shouldBe('unregistered').butNot();
    }

    for (const renderer of renderers || []) {
      renderer.locator.setupVine(vineBuilder);
      vineBuilder.source(renderer.locator.getSourceId(), null);
    }

    for (const watcher of watchers || []) {
      vineBuilder.sourceWithProvider(watcher.getSourceId(), async context => {
        const shadowRoot = (context as any)[SHADOW_ROOT];
        if (!shadowRoot) {
          throw Errors.assert(`Shadow root of ${context}`).shouldExist().butNot();
        }

        return watcher.getValue(shadowRoot);
      });
    }

    this.componentSpecs_.set(tag, {
      componentClass,
      renderers,
      shadowMode,
      tag,
      template,
      watchers,
    });
  }
}
