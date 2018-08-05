import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { BaseListener } from '../event/base-listener';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from './custom-element-ctrl';

export const SHADOW_ROOT = Symbol('shadowRoot');

/**
 * Main logic class of custom elements.
 */
export class CustomElementImpl {
  private component_: CustomElementCtrl | null = null;

  constructor(
      private readonly componentClass_: new () => CustomElementCtrl,
      private readonly domListeners_: ImmutableSet<BaseListener>,
      private readonly element_: HTMLElement,
      private readonly rendererLocators_: ImmutableSet<ResolvedRenderableLocator<any>>,
      private readonly templateStr_: string,
      private readonly watchers_:
          ImmutableSet<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>,
      private readonly vine_: VineImpl,
      private readonly shadowMode_: 'open' | 'closed' = 'closed') { }

  connectedCallback(): void {
    const ctor = this.componentClass_;
    const componentInstance = new ctor();
    this.component_ = componentInstance;

    const shadowRoot = this.getShadowRoot_();
    (componentInstance as any)[SHADOW_ROOT] = shadowRoot;
    this.setupRenderers_(componentInstance);
    this.setupWatchers_(componentInstance);
    this.setupDomListeners_(componentInstance);

    componentInstance.init(this.vine_);
  }

  disconnectedCallback(): void {
    if (this.component_) {
      this.component_.dispose();
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
      const disposableFn = domListener.listen(this.vine_, context);
      context.addDisposable(disposableFn);
    }
  }

  private setupRenderers_(context: CustomElementCtrl): void {
    for (const rendererLocator of this.rendererLocators_ || []) {
      const unlistenFn = rendererLocator.startRender(this.vine_, context);
      context.addDisposable(DisposableFunction.of(unlistenFn));
    }
  }

  private setupWatchers_(context: BaseDisposable): void {
    for (const watcher of this.watchers_) {
      context.addDisposable(watcher.startWatch(this.vine_, context, this.getShadowRoot_()));
    }
  }
}
