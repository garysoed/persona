import { injectVine, Vine } from '@grapevine';
import { cache } from '@gs-tools/data';
import { CustomElementCtrl } from './custom-element-ctrl';

export const SHADOW_ROOT = Symbol('shadowRoot');
export const __ctrl = Symbol('ctrl');

export type ElementWithCtrl = HTMLElement & {[__ctrl]?: CustomElementCtrl|null};

/**
 * Main logic class of custom elements.
 */
export class CustomElementImpl {
  constructor(
      private readonly componentClass: new (shadowRoot: ShadowRoot) => CustomElementCtrl,
      private readonly element: ElementWithCtrl,
      private readonly templateStr: string,
      private readonly vine: Vine,
      private readonly shadowMode: 'open' | 'closed' = 'closed',
  ) { }

  async connectedCallback(): Promise<void> {
    const shadowRoot = this.getShadowRoot();

    const ctor = this.componentClass;
    const componentInstance = new ctor(shadowRoot);
    this.element[__ctrl] = componentInstance;

    for (const fn of componentInstance.getInitFunctions()) {
      componentInstance.addSubscription(
          fn.call(componentInstance, this.vine, shadowRoot).subscribe(),
      );
    }

    injectVine(this.vine, componentInstance);
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
}
