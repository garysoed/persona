import { filterNonNull } from '@gs-tools/rxjs';
import { Observable } from '@rxjs';
import { distinctUntilChanged, pairwise, startWith, tap, withLatestFrom } from '@rxjs/operators';

import { RenderSpec } from '../render/render-spec';
import { Output } from '../types/output';
import { Resolver, UnresolvedElementProperty } from '../types/unresolved-element-property';

import { createSlotObs } from './create-slot-obs';


export class SingleOutput<S extends RenderSpec> implements Output<S|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, value$: Observable<RenderSpec|null>): Observable<unknown> {
    const parent$ = this.resolver(root);

    return value$
        .pipe(
            startWith(null),
            distinctUntilChanged(),
            pairwise(),
            withLatestFrom(
                parent$,
                createSlotObs(parent$, this.slotName).pipe(filterNonNull()),
            ),
            tap(([[previous, current], parentEl, slotEl]) => {
              const prevEl = slotEl.nextSibling;

              // Delete if removed.
              if (!current) {
                if (prevEl) {
                  parentEl.removeChild(prevEl);
                }
                return;
              }

              if (!previous) {
                const newEl = current.createElement();
                current.updateElement(newEl);
                parentEl.insertBefore(newEl, prevEl);
                return;
              }

              // Try to reuse the element.
              if (prevEl instanceof HTMLElement && current.canReuseElement(prevEl)) {
                current.updateElement(prevEl);
                return;
              }

              // Otherwise, remove the element, and create a new one.
              if (prevEl) {
                parentEl.removeChild(prevEl);
              }

              const newEl = current.createElement();
              current.updateElement(newEl);
              parentEl.insertBefore(newEl, slotEl.nextSibling);
            }),
        );
  }
}

class UnresolvedSingleOutput<S extends RenderSpec> implements
    UnresolvedElementProperty<Element, SingleOutput<S>> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Element>): SingleOutput<S> {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single<S extends RenderSpec>(slotName: string): UnresolvedSingleOutput<S> {
  return new UnresolvedSingleOutput(slotName);
}
