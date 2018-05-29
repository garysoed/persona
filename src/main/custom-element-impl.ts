import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { ResolvedRenderableLocator } from '../locator/locator';

/**
 * Main logic class of custom elements.
 */
export class CustomElementImpl {
  private component_: BaseDisposable | null = null;

  constructor(
      private readonly componentClass_: typeof BaseDisposable,
      private readonly element_: HTMLElement,
      private readonly rendererLocators_: ImmutableSet<ResolvedRenderableLocator<any>>,
      private readonly templateStr_: string,
      private readonly vine_: VineImpl,
      private readonly shadowMode_: 'open' | 'closed' = 'closed') { }

  connectedCallback(): void {
    const ctor = this.componentClass_;
    const componentInstance = new ctor();
    this.component_ = componentInstance;

    this.getShadowRoot_();
    this.setupRenderers_(componentInstance);
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

  private setupRenderers_(context: BaseDisposable): void {
    for (const rendererLocator of this.rendererLocators_ || []) {
      const unlistenFn = this.vine_.listen(
          rendererLocator.getStreamId(),
          value => {
            rendererLocator.setValue(value);
          }, context);
      context.addDisposable(DisposableFunction.of(unlistenFn));
    }
  }
}
