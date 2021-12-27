import {filterNonNullable} from 'gs-tools/export/rxjs';
import {of, OperatorFunction, pipe} from 'rxjs';
import {distinctUntilChanged, pairwise, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {__id} from '../render/types/node-with-id';
import {RenderContext} from '../render/types/render-context';
import {RenderSpec} from '../render/types/render-spec';
import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OSingle} from '../types/io';
import {Target} from '../types/target';
import {initSlot} from '../util/init-slot';


class ResolvedOSingle implements Resolved<UnresolvedOSingle> {
  readonly apiType = ApiType.SINGLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string|null,
      readonly target: Target,
      private readonly context: RenderContext,
  ) {}

  update(): OperatorFunction<RenderSpec|null, unknown> {
    const slotEl$ = this.slotName
      ? of(this.target).pipe(
          initSlot(this.slotName),
          filterNonNullable(),
      )
      : of(null);
    return pipe(
        switchMap(spec => {
          if (!spec) {
            return of(null);
          }
          return render(spec, this.context);
        }),
        startWith(null),
        distinctUntilChanged((a, b) => {
          if (a !== null && b !== null) {
            return a[__id] === b[__id];
          }
          return a === b;
        }),
        pairwise(),
        withLatestFrom(slotEl$),
        tap(([[previous, current], slotEl]) => {
          // Remove the previous node.
          if (previous) {
            try {
              this.target.removeChild(previous);
            } catch (e) {
            // ignored
            }
          }

          // Add the new node.
          if (current) {
            this.target.insertBefore(current, slotEl?.nextSibling ?? null);
          }
        }),
    );
  }
}

class UnresolvedOSingle implements UnresolvedIO<OSingle> {
  readonly apiType = ApiType.SINGLE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string|null,
  ) {}

  resolve(target: Target, context: RenderContext): ResolvedOSingle {
    return new ResolvedOSingle(this.slotName, target, context);
  }
}

export function osingle(refName: string|null = null): UnresolvedOSingle {
  return new UnresolvedOSingle(refName);
}
