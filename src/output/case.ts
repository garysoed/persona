import {arrayFrom, diffArray} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {hasPropertiesType, instanceofType, intersectType, notType, Type, undefinedType} from 'gs-types';
import {EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {switchMap, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {RenderContext} from '../render/types/render-context';
import {Resolved, UnresolvedIO} from '../types/ctrl';
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
  for (let current = start.nextSibling ?? parent.firstChild; current !== null; current = current.nextSibling) {
    if (!NODE_WITH_ID_TYPE.check(current)) {
      break;
    }

    children.push(current);
  }

  return children;
}

class ResolvedOCase<T> implements Resolved<UnresolvedOCase<T>> {
  readonly apiType = ApiType.CASE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string|null,
      readonly valueType: Type<T>,
      readonly target: Target,
      private readonly context: RenderContext,
  ) {}

  update(renderFn: RenderValueFn<T>): OperatorFunction<T, T> {
    const slotEl$ = this.slotName
      ? of(this.target).pipe(
          initSlot(this.slotName),
          filterNonNullable(),
      )
      : of(null);

    return value$ => {
      const render$ = value$.pipe(
          switchMap(value => {
            return renderFn(value).pipe(
                switchMap(spec => {
                  if (!spec) {
                    return of(null);
                  }
                  return render(spec, this.context);
                }),
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
          }),
          withLatestFrom(slotEl$),
          tap(([newNode, slotNode]) => {
            // Flatten the new nodes
            const flattenedNewNodes = flattenNode(newNode);

            // Iterate through one diff at a time, since moving nodes doesn't act like an array.
            let currentNodes = getContiguousSiblingNodesWithId(slotNode, this.target);
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

              currentNodes = getContiguousSiblingNodesWithId(slotNode, this.target);
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

class UnresolvedOCase<T> implements UnresolvedIO<OCase<T>> {
  readonly apiType = ApiType.CASE;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string|null,
      readonly valueType: Type<T>,
  ) {}

  resolve(target: Target, context: RenderContext): ResolvedOCase<T> {
    return new ResolvedOCase(
        this.slotName,
        this.valueType,
        target,
        context,
    );
  }
}

export function ocase<T>(valueType: Type<T>): UnresolvedOCase<T>;
export function ocase<T>(refName: string, valueType: Type<T>): UnresolvedOCase<T>;
export function ocase<T>(refOrType: string|Type<T>, valueType?: Type<T>): UnresolvedOCase<T>  {
  if (typeof refOrType === 'string') {
    if (!valueType) {
      throw new Error('Missing required valueType');
    }
    return new UnresolvedOCase(refOrType, valueType);
  }

  return new UnresolvedOCase(null, refOrType);
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