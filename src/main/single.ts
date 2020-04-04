import { filterNonNull } from 'gs-tools/export/rxjs';
import { OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, pairwise, startWith, tap, withLatestFrom } from 'rxjs/operators';

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
