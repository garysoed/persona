import {diffArray} from 'gs-tools/export/rxjs';
import {assertUnreachable} from 'gs-tools/export/typescript';
import {NEVER, Observable, OperatorFunction, of as observableOf, pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {createSlotObs} from '../main/create-slot-obs';
import {NodeWithId, __id} from '../render/node-with-id';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {Selectable} from '../types/selectable';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {UnresolvedOutput} from '../types/unresolved-output';


export class MultiOutput implements Output<ReadonlyArray<NodeWithId<Node>>> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Selectable>,
  ) { }

  output(context: PersonaContext): OperatorFunction<ReadonlyArray<NodeWithId<Node>>, unknown> {
    const parentEl = this.resolver(context);

    return pipe(
        diffArray((a, b) => a[__id] === b[__id]),
        withLatestFrom(
            createSlotObs(observableOf(parentEl), this.slotName),
        ),
        tap(([diff, slotNode]) => {
          if (!slotNode) {
            return;
          }

          switch (diff.type) {
            case 'init':
              for (let i = 0; i < diff.value.length; i++) {
                this.insertEl(parentEl, slotNode, diff.value[i], i);
              }
              return;
            case 'insert':
              this.insertEl(parentEl, slotNode, diff.value, diff.index);
              return;
            case 'delete':
              this.deleteEl(parentEl, slotNode, diff.index);
              return;
            case 'set':
              this.setEl(parentEl, slotNode, diff.value, diff.index);
              return;
            default:
              assertUnreachable(diff);
          }
        }),
    );
  }

  private deleteEl(parentNode: Node, slotNode: Node, index: number): Observable<unknown> {
    const curr = getNode(slotNode, index);

    if (!curr) {
      return NEVER;
    }

    try {
      parentNode.removeChild(curr);
    } catch (e) {
      // ignored
    }

    return NEVER;
  }

  private insertEl(
      parentNode: Selectable,
      slotNode: Node,
      node: Node,
      index: number,
  ): void {
    let curr = slotNode.nextSibling;
    for (let i = 0; i < index && curr !== null; i++) {
      curr = curr.nextSibling;
    }
    parentNode.insertBefore(node, curr);
  }

  private setEl(
      parentNode: Selectable,
      slotNode: Node,
      node: Node,
      index: number,
  ): void {
    this.deleteEl(parentNode, slotNode, index);
    this.insertEl(parentNode, slotNode, node, index);
  }
}

class UnresolvedMultiOutput implements
    UnresolvedElementProperty<Selectable, MultiOutput>,
    UnresolvedOutput<ReadonlyArray<NodeWithId<Node>>> {
  constructor(
      private readonly slotName: string,
  ) { }

  resolve(resolver: Resolver<Selectable>): MultiOutput {
    return new MultiOutput(this.slotName, resolver);
  }
}

export function multi(
    slotName: string,
): UnresolvedMultiOutput {
  return new UnresolvedMultiOutput(slotName);
}

function getNode(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}
