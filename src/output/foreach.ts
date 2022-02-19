import {$asSet, $filterNonNull, $pipe, diffArray} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {Type} from 'gs-types';
import {combineLatest, EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {map, switchMap, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {equalNodes} from '../render/types/node-with-id';
import {RenderContext} from '../render/types/render-context';
import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OForeach, OForeachConfig} from '../types/io';
import {Target} from '../types/target';
import {getContiguousSiblingNodesWithId} from '../util/contiguous-nodes-with-id';
import {initSlot} from '../util/init-slot';


// TODO: Consolidate with applyChildren.
class ResolvedOForeach<T> implements Resolved<UnresolvedOForeach<T>> {
  readonly apiType = ApiType.FOREACH;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
      readonly valueType: Type<T>,
      readonly target: Target,
      private readonly context: RenderContext,
  ) {}

  update(config: OForeachConfig<T>): OperatorFunction<readonly T[], readonly T[]> {
    const slotEl$ = of(this.target).pipe(
        initSlot(this.slotName),
        filterNonNullable(),
    );

    return values$ => {
      const render$ = values$.pipe(
          switchMap(values => {
            const node$list = values.map(value => render(config.render(value), this.context));
            if (node$list.length <= 0) {
              return of([]);
            }

            return combineLatest(node$list);
          }),
          map(nodes => [...$pipe(nodes, $filterNonNull(), $asSet())]),
          withLatestFrom(slotEl$),
          tap(([newNodes, slotNode]) => {
            // Iterate through one diff at a time, since moving nodes doesn't act like an array.
            let currentNodes = getContiguousSiblingNodesWithId(slotNode);
            let diffs = diffArray(currentNodes, newNodes, equalNodes);
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
            }
          }),
          switchMapTo(EMPTY),
      );

      return merge(values$, render$);
    };
  }
}

class UnresolvedOForeach<T> implements UnresolvedIO<OForeach<T>> {
  readonly apiType = ApiType.FOREACH;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: Target, context: RenderContext): ResolvedOForeach<T> {
    return new ResolvedOForeach(this.slotName, this.valueType, target, context);
  }
}

export function oforeach<T>(slotName: string, valueType: Type<T>): UnresolvedOForeach<T> {
  return new UnresolvedOForeach(slotName, valueType);
}

