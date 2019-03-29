import { VineImpl } from '@grapevine/main';
import { ImmutableSet } from '@gs-tools/collect';
import { cache } from '@gs-tools/data';
import { OnCreateHandler } from './component-spec';
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
      private readonly element: ElementWithCtrl,
      private readonly onCreateHandlers: ImmutableSet<OnCreateHandler>,
      private readonly templateStr: string,
      private readonly vine: VineImpl,
      private readonly shadowMode: 'open' | 'closed' = 'closed',
  ) { }

  async connectedCallback(): Promise<void> {
    const ctor = this.componentClass;
    const componentInstance = new ctor();
    this.element[__ctrl] = componentInstance;

    const shadowRoot = this.getShadowRoot();
    (componentInstance as any)[SHADOW_ROOT] = shadowRoot;
    this.setupOnCreateHandlers(componentInstance, shadowRoot);

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

  private setupOnCreateHandlers(context: CustomElementCtrl, root: ShadowRoot): void {
    for (const handler of this.onCreateHandlers) {
      context.addSubscription(handler(context, this.vine, root).subscribe());
    }
  }
}
