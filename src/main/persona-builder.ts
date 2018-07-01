import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { Errors } from 'gs-tools/export/error';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { Watcher } from '../watcher/watcher';
import { ComponentSpec, RendererSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';

function createCustomElementClass_(
    componentClass: new () => CustomElementCtrl,
    rendererLocators: ImmutableSet<ResolvedRenderableLocator<any>>,
    templateStr: string,
    watchers: ImmutableSet<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>,
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
      const rendererLocators = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .mapItem(renderer => renderer.locator);

      const template = spec.template;
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          rendererLocators,
          template,
          ImmutableSet.of(spec.watchers || []),
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
      watchers: ImmutableSet<
          ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>,
      vineBuilder: VineBuilder,
      shadowMode: 'open'|'closed' = 'closed',
      windowObj: Window = window): void {
    if (this.componentSpecs_.has(tag)) {
      throw Errors.assert(`Component with tag ${tag}`).shouldBe('unregistered').butNot();
    }

    for (const watcher of watchers || []) {
      vineBuilder.sourceWithProvider(watcher.getReadingId(), async context => {
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
