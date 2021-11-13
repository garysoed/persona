import {Subject} from 'rxjs';

import {AttributeChangedEvent} from '../types/event';

const __value$ = Symbol('attributeChange$');


interface HtmlElementWithValue extends HTMLElement {
  readonly [__value$]?: Subject<AttributeChangedEvent>;
}

export function getAttributeChangeObservable(
    element: HtmlElementWithValue,
): Subject<AttributeChangedEvent>|null {
  return element[__value$] ?? null;
}

export function setAttributeChangeObservable(
    element: HtmlElementWithValue,
    obs: Subject<AttributeChangedEvent>,
): void {
  Object.assign(element, {[__value$]: obs});
}
