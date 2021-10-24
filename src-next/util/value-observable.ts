import {Observable} from 'rxjs';

const __value$ = Symbol('value$');


interface HtmlElementWithValue<K extends string> extends HTMLElement {
  readonly [__value$]?: {readonly [key in K]?: Observable<unknown>};
}

export function getValueObservable<K extends string>(
    element: HtmlElementWithValue<K>,
    key: K,
): Observable<unknown>|null {
  return element[__value$]?.[key] ?? null;
}

export function setValueObservable<K extends string>(
    element: HtmlElementWithValue<K>,
    key: K,
    obs: Observable<unknown>,
): void {
  const map: Partial<Record<string, Observable<unknown>>> = element[__value$] ?? {};
  map[key] = obs;
  Object.assign(element, {
    [__value$]: map,
  });
}
