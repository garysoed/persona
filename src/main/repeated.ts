import { ArrayDiff, filterNonNull, scanArray } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { merge, NEVER, Observable, OperatorFunction, pipe } from 'rxjs';
import { map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { RenderSpec } from '../render/render-spec';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { createSlotObs } from './create-slot-obs';


export class RepeatedOutput implements Output<ArrayDiff<RenderSpec>> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<ArrayDiff<RenderSpec>, unknown> {
    const parentEl$ = this.resolver(context);

    return pipe(
        withLatestFrom(
            parentEl$,
            createSlotObs(parentEl$, this.slotName).pipe(filterNonNull()),
        ),
        map(([diff, parentEl, slotNode]) => {
          switch (diff.type) {
            case 'init':
              const update$: Array<Observable<unknown>> = [];
              for (let i = 0; i < diff.value.length; i++) {
                update$.push(this.insertEl(parentEl, slotNode, diff.value[i], i));
              }

              return {
                type: 'init' as 'init',
                value: update$,
              };
            case 'insert':
              return {
                type: 'insert' as 'insert',
                index: diff.index,
                value: this.insertEl(parentEl, slotNode, diff.value, diff.index),
              };
            case 'delete':
              return {
                type: 'delete' as 'delete',
                index: diff.index,
                value: this.deleteEl(parentEl, slotNode, diff.index),
              };
            case 'set':
              return {
                type: 'set' as 'set',
                index: diff.index,
                value: this.setEl(parentEl, slotNode, diff.value, diff.index),
              };
            default:
              assertUnreachable(diff);
          }
        }),
        scanArray<Observable<unknown>>(),
        switchMap(obs$ => merge(...obs$)),
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
      spec: RenderSpec,
      index: number,
  ): Observable<unknown> {
    return spec.createNode().pipe(
        tap(newEl => {
          let curr = slotNode.nextSibling;
          for (let i = 0; i < index && curr !== null; i++) {
            curr = curr.nextSibling;
          }
          parentNode.insertBefore(newEl, curr);
        }),
        shareReplay({bufferSize: 1, refCount: true}),
        switchMap(newEl => spec.registerNode(newEl)),
    );
  }

  private setEl(
      parentNode: Element,
      slotNode: Node,
      spec: RenderSpec,
      index: number,
  ): Observable<unknown> {
    const existingEl = getNode(slotNode, index);

    if (!(existingEl instanceof Node) ||
        !spec.canReuseNode(existingEl)) {
      this.deleteEl(parentNode, slotNode, index);
      return this.insertEl(parentNode, slotNode, spec, index);
    }

    return spec.registerNode(existingEl);
  }
}

class UnresolvedRepeatedOutput
    implements UnresolvedElementProperty<Element, RepeatedOutput> {
  constructor(
      private readonly slotName: string,
  ) { }

  resolve(resolver: Resolver<Element>): RepeatedOutput {
    return new RepeatedOutput(this.slotName, resolver);
  }
}

export function repeated(
    slotName: string,
): UnresolvedRepeatedOutput {
  return new UnresolvedRepeatedOutput(slotName);
}

function getNode(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}
