import { filterNonNull } from 'gs-tools/export/rxjs';
import { OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, pairwise, startWith, tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { createSlotObs } from '../main/create-slot-obs';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';


export class SingleOutput implements Output<Node|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<Node|null, unknown> {
    const parent$ = this.resolver(context);

    return pipe(
        startWith(null),
        distinctUntilChanged(),
        pairwise(),
        withLatestFrom(
            parent$,
            createSlotObs(parent$, this.slotName).pipe(filterNonNull()),
        ),
        tap(([[previous, current], parentEl, slotEl]) => {
          // Remove the previous node.
          if (previous) {
            try {
              parentEl.removeChild(previous);
            } catch (e) {
              // ignored
            }
          }

          // Add the new node.
          if (current) {
            parentEl.insertBefore(current, slotEl.nextSibling);
          }
        }),
    );
  }
}

class UnresolvedSingleOutput implements
    UnresolvedElementProperty<Element, SingleOutput>, UnresolvedOutput<Node|null> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Element>): SingleOutput {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single(slotName: string): UnresolvedSingleOutput {
  return new UnresolvedSingleOutput(slotName);
}
