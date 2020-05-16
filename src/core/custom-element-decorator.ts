import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CustomElementCtrlCtor } from '../types/custom-element-ctrl';

import { TemplateService } from './template-service';

export const SHADOW_ROOT = Symbol('shadowRoot');
export const __onDisconnect = Symbol('onDisconnect');

export type ElementWithOnDisconnect = HTMLElement & {[__onDisconnect]?: Subject<void>|null};

/**
 * Main logic class of custom elements.
 */
export class CustomElementDecorator {
  constructor(
      private readonly componentClass: CustomElementCtrlCtor,
      private readonly element: ElementWithOnDisconnect,
      private readonly tag: string,
      private readonly templateService: TemplateService,
      private readonly vine: Vine,
      private readonly shadowMode: 'open' | 'closed' = 'closed',
  ) {

  }

  connectedCallback(): void {
    const shadowRoot = this.getShadowRoot();

    const ctor = this.componentClass;
    const onDisconnect$ = new ReplaySubject<void>(1);
    const componentInstance = new ctor({shadowRoot, vine: this.vine});
    componentInstance.run().pipe(takeUntil(onDisconnect$)).subscribe();
    this.element[__onDisconnect] = onDisconnect$;
  }

  disconnectedCallback(): void {
    const onDisconnect$ = this.element[__onDisconnect];
    if (onDisconnect$) {
      onDisconnect$.next();
      this.element[__onDisconnect] = null;
    }
  }

  @cache()
  private getShadowRoot(): ShadowRoot {
    const shadowRoot = this.element.attachShadow({mode: this.shadowMode});
    shadowRoot.appendChild(this.templateService.getTemplate(this.tag).content.cloneNode(true));

    return shadowRoot;
  }
}
