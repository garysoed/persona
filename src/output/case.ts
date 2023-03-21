import {arrayFrom, diffArray} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {hasPropertiesType, instanceofType, intersectType, notType, undefinedType} from 'gs-types';
import {EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {map, switchMap, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {RenderContext} from '../render/types/render-context';
import {ApiType, IOType, OCase, RenderValueFn} from '../types/io';
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

function getContiguousSiblingNodesWithId(start: Node|null, parent: Node): readonly NodeWithId[] {
  if (!start) {
    const children: NodeWithId[] = [];
    for (let current = parent.lastChild; current !== null; current = current?.previousSibling) {
      if (!NODE_WITH_ID_TYPE.check(current)) {
        break;
      }

      children.push(current);
    }
    return children.reverse();
  }
  const children: NodeWithId[] = [];
  for (
    let current = start.nextSibling ?? parent.firstChild;
    current !== null;
    current = current.nextSibling
  ) {
    if (!NODE_WITH_ID_TYPE.check(current)) {
      break;
    }

    children.push(current);
  }

  return children;
}

class ResolvedOCase<T> implements OCase<T> {
  readonly apiType = ApiType.CASE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string|null,
      private readonly trackBy: TrackByFn<T>,
  ) {}

  resolve(
      target: Target,
      context: RenderContext,
  ): (renderFn: RenderValueFn<T>) => OperatorFunction<T, T> {
    return (renderFn: RenderValueFn<T>) => {
      const slotEl$ = this.slotName
        ? of(target).pipe(
            initSlot(this.slotName),
            filterNonNullable(),
        )
        : of(null);

      return value$ => {
        const spec$ = value$.pipe(renderFn);
        const render$ = value$.pipe(
            withLatestFrom(spec$),
            map(([value, spec]) => ({spec, value})),
            switchMap(({spec, value}) => {
              if (!spec) {
                return of(null);
              }
              return render(spec, context).pipe(
                  tap(node => {
                    if (!node) {
                      return;
                    }

                    if (!(node instanceof DocumentFragment)) {
                      setId(node, this.trackBy(value));
                      return;
                    }

                    for (let i = 0; i < node.childNodes.length; i++) {
                      setId(node.childNodes.item(i), this.trackBy(value), i);
                    }
                  }),
              );
            }),
            withLatestFrom(slotEl$),
            tap(([newNode, slotNode]) => {
              // Flatten the new nodes
              const flattenedNewNodes = flattenNode(newNode);

              // Iterate through one diff at a time, since moving nodes doesn't act like an array.
              let currentNodes = getContiguousSiblingNodesWithId(slotNode, target);
              let diffs = diffArray<Node>(currentNodes, flattenedNewNodes, equalNodes);
              let i = 0;
              while (diffs.length > 0) {
                const [diff] = diffs;
                switch (diff.type) {
                  case 'insert': {
                    const insertBefore = getInsertBeforeTarget(diff.index, currentNodes, slotNode);
                    target.insertBefore(diff.value, insertBefore);
                    break;
                  }
                  case 'delete':
                    target.removeChild(currentNodes[diff.index]);
                    break;
                }

                currentNodes = getContiguousSiblingNodesWithId(slotNode, target);
                diffs = diffArray(currentNodes, flattenedNewNodes, equalNodes);
                i++;
                if (i >= 100) {
                  return;
                }
              }
            }),
            switchMapTo(EMPTY),
        );

        return merge(value$, render$);
      };
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

type TrackByFn<T> = (value: T) => unknown;
export function ocase<T = never>(trackBy?: TrackByFn<T>): ResolvedOCase<T>;
export function ocase<T = never>(refName: string, trackBy?: TrackByFn<T>): ResolvedOCase<T>;
export function ocase<T = never>(
    refOrTrackBy?: string|TrackByFn<T>,
    trackBy?: TrackByFn<T>,
): ResolvedOCase<T>  {
  if (typeof refOrTrackBy === 'string') {
    return new ResolvedOCase(refOrTrackBy, trackBy ?? (value => value));
  }

  return new ResolvedOCase(null, refOrTrackBy ?? (value => value));
}

function flattenNode(node: Node|null): readonly Node[] {
  if (!node) {
    return [];
  }

  if (node instanceof DocumentFragment) {
    return arrayFrom(node.childNodes);
  }

  return [node];
}