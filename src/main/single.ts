import { filterNonNull } from 'gs-tools/export/rxjs';
import { NEVER, OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, pairwise, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { RenderSpec } from '../render/render-spec';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { createSlotObs } from './create-slot-obs';


export class SingleOutput implements Output<RenderSpec|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(root: ShadowRootLike): OperatorFunction<RenderSpec|null, unknown> {
    const parent$ = this.resolver(root);

    return pipe(
        startWith(null),
        distinctUntilChanged(),
        pairwise(),
        withLatestFrom(
            parent$,
            createSlotObs(parent$, this.slotName).pipe(filterNonNull()),
        ),
        switchMap(([[previous, current], parentEl, slotEl]) => {
          const prevEl = slotEl.nextSibling;

          // Delete if removed.
          if (!current) {
            if (prevEl) {
              parentEl.removeChild(prevEl);
            }
            return NEVER;
          }

          if (!previous) {
            return current.createElement().pipe(
                tap(newEl => parentEl.insertBefore(newEl, prevEl)),
                shareReplay({bufferSize: 1, refCount: true}),
                switchMap(newEl => current.registerElement(newEl)),
            );
          }

          // Try to reuse the element.
          if (prevEl instanceof HTMLElement && current.canReuseElement(prevEl)) {
            return current.registerElement(prevEl);
          }

          // Otherwise, remove the element, and create a new one.
          if (prevEl) {
            parentEl.removeChild(prevEl);
          }

          return current.createElement().pipe(
              tap(newEl => parentEl.insertBefore(newEl, slotEl.nextSibling)),
              shareReplay({bufferSize: 1, refCount: true}),
              switchMap(newEl => current.registerElement(newEl)),
          );
        }),
    );
  }
}

class UnresolvedSingleOutput implements
    UnresolvedElementProperty<Element, SingleOutput> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Element>): SingleOutput {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single(slotName: string): UnresolvedSingleOutput {
  return new UnresolvedSingleOutput(slotName);
}
