import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/export/error';
import { BaseListener } from '../event/base-listener';
import { DomListener } from '../event/dom-listener';
import { KeydownListener } from '../event/keydown-listener';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { ComponentSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';

function createCustomElementClass_(
    componentClass: new () => CustomElementCtrl,
    listeners: ImmutableSet<BaseListener>,
    rendererLocators: ImmutableSet<ResolvedRenderableLocator<any>>,
    templateStr: string,
    watchers: ImmutableSet<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>,
    vine: VineImpl,
    shadowMode: 'open'|'closed' = 'closed'): typeof HTMLElement {
  return class extends HTMLElement {
    private readonly customElementImpl_: CustomElementImpl = new CustomElementImpl(
        componentClass,
        listeners,
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

  constructor(private readonly customElementAnnotationsCache_: Annotations<ComponentSpec>) { }

  build(
      customElementRegistry: CustomElementRegistry,
      vine: VineImpl,
      shadowMode: 'open'|'closed' = 'closed'): void {
    for (const spec of this.componentSpecs_.values()) {
      const rendererLocators = ImmutableSet.of<RendererSpec>(spec.renderers || [])
          .mapItem(renderer => renderer.locator);
      const domListeners = ImmutableSet.of<OnDomSpec>(spec.listeners || [])
          .mapItem(({elementLocator, eventName, options, propertyKey}) => {
            return new DomListener(elementLocator, eventName, propertyKey, options);
          });
      const keydownListeners = ImmutableSet.of<OnKeydownSpec>(spec.keydownSpecs || [])
          .mapItem(({elementLocator, key, matchOptions, options, propertyKey}) => {
            return new KeydownListener(
                key,
                matchOptions || {},
                elementLocator,
                propertyKey,
                options);
          });

      const template = spec.template;
      const elementClass = createCustomElementClass_(
          spec.componentClass,
          domListeners.addAll(keydownListeners),
          rendererLocators,
          template,
          ImmutableSet.of(spec.watchers || []),
          vine,
          shadowMode);
      customElementRegistry.define(spec.tag, elementClass);
    }
  }

  register(
      rootCtrls: (typeof CustomElementCtrl)[],
      vineBuilder: VineBuilder): void {
    for (const ctrl of rootCtrls) {
      const values = this.customElementAnnotationsCache_
          .forCtor(ctrl)
          .getAttachedValues()
          .get(__class);
      if (!values) {
        throw Errors.assert(`Annotations for ${ctrl.name}`).shouldExist().butNot();
      }

      const componentSpec = [...values][0];
      if (!componentSpec) {
        throw Errors.assert(`Annotations for ${ctrl.name}`).shouldExist().butNot();
      }

      if (this.componentSpecs_.has(componentSpec.tag)) {
        throw Errors.assert(`Component with tag ${componentSpec.tag}`)
            .shouldBe('unregistered')
            .butNot();
      }

      this.componentSpecs_.set(componentSpec.tag, componentSpec);

      for (const watcher of componentSpec.watchers || []) {
        if (vineBuilder.isRegistered(watcher.getReadingId())) {
          continue;
        }

        vineBuilder.sourceWithProvider(watcher.getReadingId(), async context => {
          const shadowRoot = (context as any)[SHADOW_ROOT];
          if (!shadowRoot) {
            throw Errors.assert(`Shadow root of ${context}`).shouldExist().butNot();
          }

          return watcher.getValue(shadowRoot);
        });
      }
    }
  }
}
