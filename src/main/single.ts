import { filterNonNull } from 'gs-tools/export/rxjs';
import { NEVER, OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, pairwise, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { RenderSpec } from '../render/render-spec';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { createSlotObs } from './create-slot-obs';


export class SingleOutput implements Output<RenderSpec|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<RenderSpec|null, unknown> {
    const parent$ = this.resolver(context);

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
            return current.createNode().pipe(
                tap(newEl => parentEl.insertBefore(newEl, prevEl)),
                shareReplay({bufferSize: 1, refCount: true}),
                switchMap(newEl => current.registerNode(newEl)),
            );
          }

          // Try to reuse the element.
          if (prevEl instanceof Node && current.canReuseNode(prevEl)) {
            return current.registerNode(prevEl);
          }

          // Otherwise, remove the element, and create a new one.
          if (prevEl) {
            parentEl.removeChild(prevEl);
          }

          return current.createNode().pipe(
              tap(newEl => parentEl.insertBefore(newEl, slotEl.nextSibling)),
              shareReplay({bufferSize: 1, refCount: true}),
              switchMap(newEl => current.registerNode(newEl)),
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
