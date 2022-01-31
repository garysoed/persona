import {$asArray, $filterNonNull, $pipe, diffArray} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {combineLatest, EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {map, switchMap, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {equalNodes} from '../render/types/node-with-id';
import {RenderContext} from '../render/types/render-context';
import {RenderSpec} from '../render/types/render-spec';
import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OMulti} from '../types/io';
import {Target} from '../types/target';
import {getContiguousSiblingNodesWithId} from '../util/contiguous-nodes-with-id';
import {initSlot} from '../util/init-slot';


// TODO: Consolidate with applyChildren.
class ResolvedOMulti implements Resolved<UnresolvedOMulti> {
  readonly apiType = ApiType.MULTI;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
      readonly target: Target,
      private readonly context: RenderContext,
  ) {}

  update(): OperatorFunction<readonly RenderSpec[], readonly RenderSpec[]> {
    const slotEl$ = of(this.target).pipe(
        initSlot(this.slotName),
        filterNonNullable(),
    );

    return specs$ => {
      const render$ = specs$.pipe(
          switchMap(specs => {
            const node$list = specs.map(spec => render(spec, this.context));
            if (node$list.length <= 0) {
              return of([]);
            }

            return combineLatest(node$list);
          }),
          map(nodes => $pipe(nodes, $filterNonNull(), $asArray())),
          withLatestFrom(slotEl$),
          tap(([newNodes, slotNode]) => {
            // Iterate through one diff at a time, since moving nodes doesn't act like an array.
            let currentNodes = getContiguousSiblingNodesWithId(slotNode);
            let diffs = diffArray(currentNodes, newNodes, equalNodes);
            let i = 0;
            while (diffs.length > 0) {
              const [diff] = diffs;
              switch (diff.type) {
                case 'insert': {
                  const insertBefore = currentNodes[diff.index] ?? slotNode.nextSibling;
                  this.target.insertBefore(diff.value, insertBefore);
                  break;
                }
                case 'delete':
                  this.target.removeChild(currentNodes[diff.index]);
                  break;
              }

              currentNodes = getContiguousSiblingNodesWithId(slotNode);
              diffs = diffArray(currentNodes, newNodes, equalNodes);
              i++;
              if (i > 10) {
                return;
              }
            }
          }),
          switchMapTo(EMPTY),
      );

      return merge(specs$, render$);
    };
  }
}

class UnresolvedOMulti implements UnresolvedIO<OMulti> {
  readonly apiType = ApiType.MULTI;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
  ) {}

  resolve(target: Target, context: RenderContext): ResolvedOMulti {
    return new ResolvedOMulti(this.slotName, target, context);
  }
}

export function omulti(refName: string): UnresolvedOMulti {
  return new UnresolvedOMulti(refName);
}

