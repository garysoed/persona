import { ArrayDiff } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { NEVER, Observable, OperatorFunction, pipe } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { createSlotObs } from '../main/create-slot-obs';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';


export class MultiOutput implements Output<ArrayDiff<Node>> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<ArrayDiff<Node>, unknown> {
    const parentEl$ = this.resolver(context);

    return pipe(
        withLatestFrom(
            parentEl$,
            createSlotObs(parentEl$, this.slotName),
        ),
        tap(([diff, parentEl, slotNode]) => {
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

    parentNode.removeChild(curr);

    return NEVER;
  }

  private insertEl(
      parentNode: Element,
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
      parentNode: Element,
      slotNode: Node,
      node: Node,
      index: number,
  ): void {
    this.deleteEl(parentNode, slotNode, index);
    this.insertEl(parentNode, slotNode, node, index);
  }
}

class UnresolvedMultiOutput
    implements UnresolvedElementProperty<Element, MultiOutput>, UnresolvedOutput<ArrayDiff<Node>> {
  constructor(
      private readonly slotName: string,
  ) { }

  resolve(resolver: Resolver<Element>): MultiOutput {
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
