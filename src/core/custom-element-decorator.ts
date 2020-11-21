import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {CustomElementCtrlCtor} from '../types/custom-element-ctrl';

import {BaseCtrlCtor} from './base-ctrl';
import {AttributeChangedEvent, PersonaContext} from './persona-context';
import {TemplateService} from './template-service';


export const SHADOW_ROOT = Symbol('shadowRoot');
export const __context = Symbol('context');

export type DecoratedElement = HTMLElement & {[__context]?: PersonaContext|null};

/**
 * Main logic class of custom elements.
 */
export class CustomElementDecorator {
  private readonly onAttributeChanged$ = new Subject<AttributeChangedEvent>();
  private readonly context = {
    onAttributeChanged$: this.onAttributeChanged$,
    shadowRoot: this.shadowRoot,
    vine: this.vine,
  };
  private readonly instance = new (this.componentClass)(this.context);

  constructor(
      private readonly componentClass: CustomElementCtrlCtor|BaseCtrlCtor,
      private readonly element: DecoratedElement,
      private readonly tag: string,
      private readonly templateService: TemplateService,
      private readonly vine: Vine,
      private readonly shadowMode: 'open' | 'closed' = 'closed',
  ) {
    this.element[__context] = this.context;
  }

  attributeChangedCallback(attrName: string): void {
    this.onAttributeChanged$.next({attrName});
  }

  run(): Observable<unknown> {
    return this.instance.run();
  }

  @cache()
  private get shadowRoot(): ShadowRoot {
    const shadowRoot = this.element.attachShadow({mode: this.shadowMode});
    shadowRoot.appendChild(this.templateService.getTemplate(this.tag).content.cloneNode(true));

    return shadowRoot;
  }
}
