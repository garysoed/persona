import { filterNonNull } from 'gs-tools/export/rxjs';
import { of as observableOf, OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, pairwise, startWith, tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { createSlotObs } from '../main/create-slot-obs';
import { __id, NodeWithId } from '../render/node-with-id';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';


export class SingleOutput implements Output<NodeWithId<Node>|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
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
    UnresolvedElementProperty<Element, SingleOutput>, UnresolvedOutput<NodeWithId<Node>|null> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Element>): SingleOutput {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single(slotName: string): UnresolvedSingleOutput {
  return new UnresolvedSingleOutput(slotName);
}
