import { ArrayDiff, filterNonNull, scanArray } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { merge, NEVER, Observable, OperatorFunction, pipe } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { RenderSpec } from '../render/render-spec';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { createSlotObs } from './create-slot-obs';

export class RepeatedOutput implements Output<ArrayDiff<RenderSpec>> {
  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(root: ShadowRootLike): OperatorFunction<ArrayDiff<RenderSpec>, unknown> {
    const parentEl$ = this.resolver(root);

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
    const curr = getEl(slotNode, index);

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
    let curr = slotNode.nextSibling;
    for (let i = 0; i < index && curr !== null; i++) {
      curr = curr.nextSibling;
    }

    const newEl = spec.createElement();
    parentNode.insertBefore(newEl, curr);
    return spec.registerElement(newEl);
  }

  private setEl(
      parentNode: Element,
      slotNode: Node,
      spec: RenderSpec,
      index: number,
  ): Observable<unknown> {
    const existingEl = getEl(slotNode, index);

    if (!(existingEl instanceof HTMLElement) ||
        !spec.canReuseElement(existingEl)) {
      this.deleteEl(parentNode, slotNode, index);
      return this.insertEl(parentNode, slotNode, spec, index);
    }

    return spec.registerElement(existingEl);
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

function getEl(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}
