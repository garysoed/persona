import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { BaseListener } from '../event/base-listener';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { OnCreateSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';

export const SHADOW_ROOT = Symbol('shadowRoot');
export const __ctrl = Symbol('ctrl');

export type ElementWithCtrl = HTMLElement & {[__ctrl]?: CustomElementCtrl|null};

/**
 * Main logic class of custom elements.
 */
export class CustomElementImpl {
  constructor(
      private readonly componentClass: new () => CustomElementCtrl,
      private readonly domListeners: ImmutableSet<BaseListener>,
      private readonly element: ElementWithCtrl,
      private readonly onCreateHandlers: ImmutableSet<OnCreateSpec>,
      private readonly rendererLocators: ImmutableSet<ResolvedRenderableLocator<any>>,
      private readonly templateStr: string,
      private readonly watchers: ImmutableSet<ResolvedWatchableLocator<any>>,
      private readonly vine: VineImpl,
      private readonly shadowMode: 'open' | 'closed' = 'closed') { }

  async connectedCallback(): Promise<void> {
    const ctor = this.componentClass;
    const componentInstance = new ctor();
    this.element[__ctrl] = componentInstance;

    const shadowRoot = this.getShadowRoot();
    (componentInstance as any)[SHADOW_ROOT] = shadowRoot;
    this.setupRenderers(componentInstance);
    this.setupWatchers(componentInstance);
    this.setupDomListeners(componentInstance);
    this.setupOnCreateHandlers(componentInstance);

    await new Promise(resolve => {
      window.setTimeout(() => {
        componentInstance.init(this.vine);
        resolve();
      });
    });
  }

  disconnectedCallback(): void {
    const ctrl = this.element[__ctrl];
    if (ctrl) {
      ctrl.dispose();
      this.element[__ctrl] = null;
    }
  }

  @cache()
  private getShadowRoot(): ShadowRoot {
    const shadowRoot = this.element.attachShadow({mode: this.shadowMode});
    shadowRoot.innerHTML = this.templateStr;

    return shadowRoot;
  }

  private setupDomListeners(context: CustomElementCtrl): void {
    for (const domListener of this.domListeners) {
      const subscription = domListener.listen(this.vine, context);
      context.addSubscription(subscription);
    }
  }

  private setupOnCreateHandlers(context: CustomElementCtrl): void {
    for (const {propertyKey} of this.onCreateHandlers) {
      const params = this.vine.resolveParams(context, propertyKey);
      const fn = (context as any)[propertyKey];
      if (typeof fn !== 'function') {
        throw new Error(`Property ${propertyKey.toString()} of ${context} is not a function`);
      }

      context.addSubscription(fn.call(context, ...params).subscribe(() => undefined));
    }
  }

  private setupRenderers(context: CustomElementCtrl): void {
    for (const rendererLocator of this.rendererLocators || []) {
      const subscription = rendererLocator.startRender(this.vine, context);
      context.addSubscription(subscription);
    }
  }

  private setupWatchers(context: BaseDisposable): void {
    for (const watcher of this.watchers) {
      context.addSubscription(watcher.startWatch(this.vine, context, this.getShadowRoot()));
    }
  }
}
