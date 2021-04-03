import {filterNonNullable} from 'gs-tools/export/rxjs';
import {of as observableOf, OperatorFunction, pipe} from 'rxjs';
import {distinctUntilChanged, pairwise, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {createSlotObs} from '../main/create-slot-obs';
import {__id} from '../render/node-with-id';
import {render} from '../render/render';
import {RenderSpec} from '../render/types/render-spec';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {Selectable} from '../types/selectable';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {UnresolvedOutput} from '../types/unresolved-output';


export class SingleOutput implements Output<RenderSpec|null|undefined> {
  readonly type = 'out';

  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Selectable>,
  ) { }

  output(context: ShadowContext): OperatorFunction<RenderSpec|null|undefined, unknown> {
    const parent = this.resolver(context);

    return pipe(
        switchMap(spec => {
          if (!spec) {
            return observableOf(null);
          }
          return render(spec, context);
        }),
        startWith(null),
        distinctUntilChanged((a, b) => {
          if (a !== null && b !== null) {
            return a[__id] === b[__id];
          }
          return a === b;
        }),
        pairwise(),
        withLatestFrom(
            createSlotObs(observableOf(parent), this.slotName).pipe(filterNonNullable()),
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
    UnresolvedElementProperty<Selectable, SingleOutput>, UnresolvedOutput<RenderSpec|null> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Selectable>): SingleOutput {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single(slotName: string): UnresolvedSingleOutput {
  return new UnresolvedSingleOutput(slotName);
}
