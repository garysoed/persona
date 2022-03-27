import {Subject} from 'rxjs';

const __value$ = Symbol('value$');


interface ElementWithValue<K extends string> extends Element {
  readonly [__value$]?: {readonly [key in K]?: Subject<unknown>};
}

export function getValueObservable<K extends string>(
    element: ElementWithValue<K>,
    key: K,
): Subject<unknown>|null {
  return element[__value$]?.[key] ?? null;
}

export function setValueObservable<K extends string>(
    element: ElementWithValue<K>,
    key: K,
    obs: Subject<any>,
): void {
  const map: Partial<Record<string, Subject<unknown>>> = element[__value$] ?? {};
  map[key] = obs;
  Object.assign(element, {[__value$]: map});
}

export function createMissingValueObservableError(
    target: Element,
    key: string,
): Error {
  return new Error(`Target ${target.tagName}#${target.id} has no observable value ${key}`);
}