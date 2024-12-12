import {Subject} from 'rxjs';

import {AttributeChangedEvent} from '../types/event';

const __value$ = Symbol('attributeChange$');

interface ElementWithValue extends Element {
  readonly [__value$]?: Subject<AttributeChangedEvent>;
}

export function getAttributeChangeObservable(
  element: ElementWithValue,
): Subject<AttributeChangedEvent> | null {
  return element[__value$] ?? null;
}

export function setAttributeChangeObservable(
  element: ElementWithValue,
  obs: Subject<AttributeChangedEvent>,
): void {
  Object.assign(element, {[__value$]: obs});
}
