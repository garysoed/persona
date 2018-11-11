import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { BaseListener } from '../event/base-listener';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from './custom-element-ctrl';

export const SHADOW_ROOT = Symbol('shadowRoot');
export const __ctrl = Symbol('ctrl');

export type ElementWithCtrl = HTMLElement & {[__ctrl]?: CustomElementCtrl|null};

/**
 * Main logic class of custom elements.
 */
export class CustomElementImpl {
  constructor(
      private readonly componentClass_: new () => CustomElementCtrl,
      private readonly domListeners_: ImmutableSet<BaseListener>,
      private readonly element_: ElementWithCtrl,
      private readonly rendererLocators_: ImmutableSet<ResolvedRenderableLocator<any>>,
      private readonly templateStr_: string,
      private readonly watchers_:
          ImmutableSet<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>,
      private readonly vine_: VineImpl,
      private readonly shadowMode_: 'open' | 'closed' = 'closed') { }

  async connectedCallback(): Promise<void> {
    const ctor = this.componentClass_;
    const componentInstance = new ctor();
    this.element_[__ctrl] = componentInstance;

    const shadowRoot = this.getShadowRoot_();
    (componentInstance as any)[SHADOW_ROOT] = shadowRoot;
    this.setupRenderers_(componentInstance);
    this.setupWatchers_(componentInstance);
    this.setupDomListeners_(componentInstance);

    await new Promise(resolve => {
      window.setTimeout(() => {
        componentInstance.init(this.vine_);
        resolve();
      });
    });
  }

  disconnectedCallback(): void {
    const ctrl = this.element_[__ctrl];
    if (ctrl) {
      ctrl.dispose();
      this.element_[__ctrl] = null;
    }
  }

  @cache()
  private getShadowRoot_(): ShadowRoot {
    const shadowRoot = this.element_.attachShadow({mode: this.shadowMode_});
    shadowRoot.innerHTML = this.templateStr_;

    return shadowRoot;
  }

  private setupDomListeners_(context: CustomElementCtrl): void {
    for (const domListener of this.domListeners_) {
      const subscription = domListener.listen(this.vine_, context);
      context.addSubscription(subscription);
    }
  }

  private setupRenderers_(context: CustomElementCtrl): void {
    for (const rendererLocator of this.rendererLocators_ || []) {
      const subscription = rendererLocator.startRender(this.vine_, context);
      context.addSubscription(subscription);
    }
  }

  private setupWatchers_(context: BaseDisposable): void {
    for (const watcher of this.watchers_) {
      context.addSubscription(watcher.startWatch(this.vine_, context, this.getShadowRoot_()));
    }
  }
}
