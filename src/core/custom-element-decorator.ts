import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CustomElementCtrlCtor } from '../types/custom-element-ctrl';

import { AttributeChangedEvent, PersonaContext } from './persona-context';
import { TemplateService } from './template-service';

export const SHADOW_ROOT = Symbol('shadowRoot');
export const __context = Symbol('context');

export type DecoratedElement = HTMLElement & {[__context]?: PersonaContext|null};

/**
 * Main logic class of custom elements.
 */
export class CustomElementDecorator {
  constructor(
      private readonly componentClass: CustomElementCtrlCtor,
      private readonly element: DecoratedElement,
      private readonly tag: string,
      private readonly templateService: TemplateService,
      private readonly vine: Vine,
      private readonly shadowMode: 'open' | 'closed' = 'closed',
  ) {

  }

  attributeChangedCallback(attrName: string, oldValue: string, newValue: string): void {
    const context = this.element[__context];
    if (!context) {
      return;
    }
    context.onAttributeChanged$.next({attrName, oldValue, newValue});
  }

  connectedCallback(): void {
    if (this.element[__context]) {
      return;
    }

    const ctor = this.componentClass;
    const onDisconnect$ = new ReplaySubject<void>(1);
    const onAttributeChanged$ = new Subject<AttributeChangedEvent>();
    const context = {
      onAttributeChanged$,
      onDisconnect$,
      shadowRoot: this.shadowRoot,
      vine: this.vine,
    };
    const componentInstance = new ctor(context);
    componentInstance.run().pipe(takeUntil(onDisconnect$)).subscribe();
    this.element[__context] = context;
  }

  disconnectedCallback(): void {
    const context = this.element[__context];
    if (context) {
      context.onDisconnect$.next();
      context.onDisconnect$.complete();
      context.onAttributeChanged$.next();
      context.onAttributeChanged$.complete();
      this.element[__context] = null;
    }
  }

  @cache()
  private get shadowRoot(): ShadowRoot {
    const shadowRoot = this.element.attachShadow({mode: this.shadowMode});
    shadowRoot.appendChild(this.templateService.getTemplate(this.tag).content.cloneNode(true));

    return shadowRoot;
  }
}
