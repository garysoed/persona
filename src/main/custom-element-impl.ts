import { VineImpl } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { of as observableOf } from 'rxjs';
import { OnCreateSpec, OutputSpec } from './component-spec';
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
      private readonly onCreateHandlers: ImmutableSet<OnCreateSpec>,
      private readonly outputs: ImmutableSet<OutputSpec>,
      private readonly templateStr: string,
      private readonly vine: VineImpl,
      private readonly shadowMode: 'open' | 'closed' = 'closed') { }

  async connectedCallback(): Promise<void> {
    const ctor = this.componentClass;
    const componentInstance = new ctor();
    this.element[__ctrl] = componentInstance;

    const shadowRoot = this.getShadowRoot();
    (componentInstance as any)[SHADOW_ROOT] = shadowRoot;
    this.setupOnCreateHandlers(componentInstance);
    this.setupOutput(componentInstance);

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

  private setupOnCreateHandlers(context: CustomElementCtrl): void {
    for (const {propertyKey} of this.onCreateHandlers) {
      const params = this.vine.resolveParams(context, propertyKey);
      const fn = (context as any)[propertyKey];
      if (typeof fn !== 'function') {
        throw new Error(`Property ${propertyKey.toString()} of ${context} is not a function`);
      }

      context.addSubscription(fn.call(context, ...params).subscribe());
    }
  }

  private setupOutput(context: CustomElementCtrl): void {
    const shadowRoot = this.getShadowRoot();

    for (const {output, propertyKey} of this.outputs) {
      const params = this.vine.resolveParams(context, propertyKey);
      const fn = (context as any)[propertyKey];

      const valueObs = typeof fn !== 'function' ? observableOf(fn) : fn.call(context, ...params);
      context.addSubscription(output.output(shadowRoot, valueObs).subscribe());
    }
  }
}
