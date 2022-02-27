import {arrayFrom} from 'gs-testing/src/util/flatten-node';
import {$asArray, $asSet, $filterNonNull, $flat, $map, $pipe, diffArray} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {hasPropertiesType, instanceofType, intersectType, notType, Type, undefinedType} from 'gs-types';
import {combineLatest, EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {map, switchMap, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {RenderContext} from '../render/types/render-context';
import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OForeach, RenderValuesFn} from '../types/io';
import {Target} from '../types/target';
import {initSlot} from '../util/init-slot';


const __id = Symbol('id');
const __subId = Symbol('subid');

interface NodeWithId extends Node {
  [__id]?: unknown;
  [__subId]?: number;
}
const NODE_WITH_ID_TYPE = intersectType([
  instanceofType(Node),
  hasPropertiesType({
    [__id]: notType(undefinedType),
  }),
]);

export function equalNodes(a: NodeWithId, b: NodeWithId): boolean {
  return a[__id] === b[__id] && a[__subId] === b[__subId];
}

function setId(target: NodeWithId, id: unknown, subId?: number): void {
  target[__id] = id;
  if (subId !== undefined) {
    target[__subId] = subId;
  }
}

function getContiguousSiblingNodesWithId(start: Node): readonly NodeWithId[] {
  const children: NodeWithId[] = [];
  for (let current = start.nextSibling; current !== null; current = current.nextSibling) {
    if (!NODE_WITH_ID_TYPE.check(current)) {
      break;
    }

    children.push(current);
  }

  return children;
}

// TODO: Consolidate with applyChildren.
export class ResolvedOForeach<T> implements Resolved<UnresolvedOForeach<T>> {
  readonly apiType = ApiType.FOREACH;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
      readonly valueType: Type<T>,
      readonly target: Target,
      private readonly context: RenderContext,
  ) {}

  update(renderFn: RenderValuesFn<T>): OperatorFunction<readonly T[], readonly T[]> {
    const slotEl$ = of(this.target).pipe(
        initSlot(this.slotName),
        filterNonNullable(),
    );

    return values$ => {
      const render$ = values$.pipe(
          switchMap(values => {
            const node$list = values.map((value, index) => {
              return renderFn(value, index).pipe(
                  switchMap(spec => spec ? render(spec, this.context) : of(null)),
                  tap(node => {
                    if (!node) {
                      return;
                    }

                    if (!(node instanceof DocumentFragment)) {
                      setId(node, value);
                      return;
                    }

                    for (let i = 0; i < node.childNodes.length; i++) {
                      setId(node.childNodes.item(i), value, i);
                    }
                  }),
              );
            });
            if (node$list.length <= 0) {
              return of([]);
            }

            return combineLatest(node$list);
          }),
          map(nodes => [...$pipe(nodes, $filterNonNull(), $asSet())]),
          withLatestFrom(slotEl$),
          tap(([newNodes, slotNode]) => {
            // Flatten the new nodes
            const flattenedNewNodes = $pipe(
                newNodes,
                $map(node => {
                  if (!(node instanceof DocumentFragment)) {
                    return [node];
                  }

                  return arrayFrom(node.childNodes);
                }),
                $flat(),
                $asArray(),
            );

            // Iterate through one diff at a time, since moving nodes doesn't act like an array.
            let currentNodes = getContiguousSiblingNodesWithId(slotNode);
            let diffs = diffArray<Node>(currentNodes, flattenedNewNodes, equalNodes);
            let i = 0;
            while (diffs.length > 0) {
              const [diff] = diffs;
              switch (diff.type) {
                case 'insert': {
                  const insertBefore = getInsertBeforeTarget(diff.index, currentNodes, slotNode);
                  this.target.insertBefore(diff.value, insertBefore);
                  break;
                }
                case 'delete':
                  this.target.removeChild(currentNodes[diff.index]);
                  break;
              }

              currentNodes = getContiguousSiblingNodesWithId(slotNode);
              diffs = diffArray(currentNodes, flattenedNewNodes, equalNodes);
              i++;
              if (i >= 500) {
                // eslint-disable-next-line no-console
                console.warn('Infinite loop for foreach detected');
                return;
              }
            }
          }),
          switchMapTo(EMPTY),
      );

      return merge(values$, render$);
    };
  }
}

function getInsertBeforeTarget(
    index: number,
    currentNodes: readonly Node[],
    slotNode: Node|null,
): Node|null {
  // Try the specified node first.
  const targetNode = currentNodes[index];
  if (targetNode) {
    return targetNode;
  }

  // If not available, return the next sibling after the slot node if there are no current node
  const lastNode = currentNodes[currentNodes.length - 1];
  if (lastNode) {
    return lastNode.nextSibling;
  }

  return slotNode?.nextSibling ?? null;
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

