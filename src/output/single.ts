import { OperatorFunction, of as observableOf, pipe } from 'rxjs';
import { distinctUntilChanged, pairwise, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { filterNonNull } from 'gs-tools/export/rxjs';

import { NodeWithId, __id } from '../render/node-with-id';
import { Output } from '../types/output';
import { PersonaContext } from '../core/persona-context';
import { Resolver } from '../types/resolver';
import { Selectable } from '../types/selectable';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';
import { createSlotObs } from '../main/create-slot-obs';


export class SingleOutput implements Output<NodeWithId<Node>|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Selectable>,
  ) { }

  output(context: PersonaContext): OperatorFunction<NodeWithId<Node>|null, unknown> {
    const parent = this.resolver(context);

    return pipe(
        startWith(null),
        distinctUntilChanged((a, b) => {
          if (a !== null && b !== null) {
            return a[__id] === b[__id];
          }
          return a === b;
        }),
        pairwise(),
        withLatestFrom(
            createSlotObs(observableOf(parent), this.slotName).pipe(filterNonNull()),
        ),
        tap(([[previous, current], slotEl]) => {
          // Remove the previous node.
          if (previous) {
            try {
              parent.removeChild(previous);
            } catch (e) {
              // ignored
            }
          }

          // Add the new node.
          if (current) {
            parent.insertBefore(current, slotEl.nextSibling);
          }
        }),
    );
  }
}

class UnresolvedSingleOutput implements
    UnresolvedElementProperty<Selectable, SingleOutput>, UnresolvedOutput<NodeWithId<Node>|null> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Selectable>): SingleOutput {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single(slotName: string): UnresolvedSingleOutput {
  return new UnresolvedSingleOutput(slotName);
}
