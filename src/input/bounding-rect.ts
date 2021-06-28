import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {resizeObservable} from '../util/resize-observable';


export class BoundingRectInput implements Input<DOMRect> {
  constructor(
    readonly resolver: Resolver<Element>,
    readonly options: ResizeObserverOptions,
  ) { }

  getValue(context: ShadowContext): Observable<DOMRect> {
    const el = this.resolver(context);
    return resizeObservable(el, this.options).pipe(
        startWith({}),
        map(() => el.getBoundingClientRect()),
    );
  }
}

export class UnresolvedBoundingRect implements UnresolvedElementProperty<Element, BoundingRectInput> {
  constructor(
      readonly options: ResizeObserverOptions,
  ) { }

  resolve(resolver: Resolver<Element>): BoundingRectInput {
    return new BoundingRectInput(resolver, this.options);
  }
}

export function boundingRect(options: ResizeObserverOptions = {}): UnresolvedBoundingRect {
  return new UnresolvedBoundingRect(options);
}
