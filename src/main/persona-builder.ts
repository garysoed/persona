import { VineApp, VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/export/error';
import { AnyType, IterableOfType } from 'gs-types/export';
import { BaseListener } from '../event/base-listener';
import { DomListener } from '../event/dom-listener';
import { KeydownListener } from '../event/keydown-listener';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { BaseComponentSpec, ComponentSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from './component-spec';
import { __customElementImplFactory, CustomElementClass } from './custom-element-class';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl, SHADOW_ROOT } from './custom-element-impl';

interface FullComponentSpec extends ComponentSpec, BaseComponentSpec { }

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

      for (const watcher of baseComponentSpec.watchers || []) {
        if (builder.isRegistered(watcher.getReadingId())) {
          continue;
        }

        builder.sourceWithProvider(watcher.getReadingId(), context => {
          const shadowRoot = (context as any)[SHADOW_ROOT];
          if (!shadowRoot) {
            throw Errors.assert(`Shadow root of ${context}`).shouldExist().butNot();
          }

          return watcher.getValue(shadowRoot);
        });
      }

      for (const {locator, propertyKey, target} of baseComponentSpec.renderers || []) {
        vineOut(locator.getWritingId())(target, propertyKey);
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
      if (!IterableOfType(AnyType()).check(value) ||
          !IterableOfType(AnyType()).check(existingValue)) {
        // Ignore the new value, since it belongs to the ancestor class.
        continue;
      }

      combinedSpec[key] = [...existingValue, ...value] as unknown as T[keyof T];
    }
  }

  if (!combinedSpec) {
    throw Errors.assert(`Annotations for ${ctrl.name}`).shouldExist().butNot();
  }

  return combinedSpec;
}

function createCustomElementClass_(
    componentClass: new () => CustomElementCtrl,
    listeners: ImmutableSet<BaseListener>,
    rendererLocators: ImmutableSet<ResolvedRenderableLocator<any>>,
    templateStr: string,
    watchers: ImmutableSet<ResolvedWatchableLocator<any>>,
    vine: VineImpl): CustomElementClass {
  const customElementImplFactory = (element: HTMLElement, shadowMode: 'open'|'closed') => {
    return new CustomElementImpl(
        componentClass,
        listeners,
        element,
        rendererLocators,
        templateStr,
        watchers,
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
