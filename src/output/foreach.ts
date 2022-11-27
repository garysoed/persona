import {$asArray, $asSet, $filterNonNull, $flat, $map, diffArray, arrayFrom} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {hasPropertiesType, instanceofType, intersectType, notType, stringType, undefinedType} from 'gs-types';
import {combineLatest, EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {RenderContext} from '../render/types/render-context';
import {ApiType, IOType, OForeach, RenderValueFn} from '../types/io';
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

function getCurrentNodes(parentNode: Node, start: Node|null): readonly NodeWithId[] {
  if (start) {
    return getContiguousSiblingNodesWithId(start);
  }

  const guessStart = parentNode.firstChild;
  if (!NODE_WITH_ID_TYPE.check(guessStart)) {
    return [];
  }
  return [guessStart, ...getContiguousSiblingNodesWithId(guessStart)];
}

export class ResolvedOForeach<T> implements OForeach<T> {
  readonly apiType = ApiType.FOREACH;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string|null,
      private readonly trackByFn: TrackByFn<T>,
  ) {}

  resolve(target: Target, context: RenderContext): (renderFn: RenderValueFn<T>) => OperatorFunction<readonly T[], readonly T[]> {
    return (renderFn: RenderValueFn<T>) => {
      const slotEl$ = of(target).pipe(
          initSlot(this.slotName),
      );

      return values$ => {
        const render$ = values$.pipe(
            switchMap(values => {
              const node$list = values.map((value) => {
                return of(value).pipe(
                    renderFn,
                    switchMap(spec => spec ? render(spec, context) : of(null)),
                    tap(node => {
                      if (!node) {
                        return;
                      }

                      if (!(node instanceof DocumentFragment)) {
                        setId(node, this.trackByFn(value));
                        return;
                      }

                      for (let i = 0; i < node.childNodes.length; i++) {
                        setId(node.childNodes.item(i), this.trackByFn(value), i);
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

                    return arrayFrom<Node>(node.childNodes);
                  }),
                  $flat(),
                  $asArray(),
              );

              // Iterate through one diff at a time, since moving nodes doesn't act like an array.
              let currentNodes = getCurrentNodes(target, slotNode);
              let diffs = diffArray<Node>(currentNodes, flattenedNewNodes, equalNodes);
              let i = 0;
              while (diffs.length > 0) {
                const [diff] = diffs;
                switch (diff.type) {
                  case 'insert': {
                    const insertBefore = getInsertBeforeTarget(diff.index, currentNodes, slotNode, target);
                    target.insertBefore(diff.value, insertBefore);
                    break;
                  }
                  case 'delete':
                    target.removeChild(currentNodes[diff.index]);
                    break;
                }

                currentNodes = getCurrentNodes(target, slotNode);
                diffs = diffArray(currentNodes, flattenedNewNodes, equalNodes);
                i++;
                if (i >= 500) {
                // eslint-disable-next-line no-console
                  console.warn('Infinite loop for foreach detected');
                  return;
                }
              }
            }),
            switchMap(() => EMPTY),
        );

        return merge(values$, render$);
      };
    };
  }
}

function getInsertBeforeTarget(
    index: number,
    currentNodes: readonly Node[],
    slotNode: Node|null,
    target: Target,
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

  if (!slotNode) {
    return target.firstChild;
  }

  return slotNode.nextSibling ?? null;
}

type TrackByFn<T> = (value: T) => unknown;
export function oforeach<T = never>(trackBy?: TrackByFn<T>): ResolvedOForeach<T>;
export function oforeach<T = never>(slotName: string, trackBy?: TrackByFn<T>): ResolvedOForeach<T>;
export function oforeach<T = never>(slotNameOrTrackBy?: string|TrackByFn<T>, trackBy?: TrackByFn<T>): ResolvedOForeach<T> {
  if (stringType.check(slotNameOrTrackBy)) {
    return new ResolvedOForeach(slotNameOrTrackBy, trackBy ?? (value => value));
  }
  return new ResolvedOForeach(null, slotNameOrTrackBy ?? (value => value));
}

