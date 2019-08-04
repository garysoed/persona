import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { assertUnreachable } from '@gs-tools/typescript';
import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import { RenderSpec } from '../render/render-spec';
import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { createSlotObs } from './create-slot-obs';


export class RepeatedOutput implements Output<ArrayDiff<RenderSpec>> {
  constructor(
      readonly slotName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, value$: Observable<ArrayDiff<RenderSpec>>): Observable<unknown> {
    const parentEl$ = this.resolver(root);

    return value$
        .pipe(
            withLatestFrom(
                parentEl$,
                createSlotObs(parentEl$, this.slotName).pipe(filterNonNull()),
            ),
            tap(([diff, parentEl, slotNode]) => {
              switch (diff.type) {
                case 'init':
                  for (let i = 0; i < diff.value.length; i++) {
                    this.insertEl(parentEl, slotNode, diff.value[i], i);
                  }
                  break;
                case 'insert':
                  this.insertEl(parentEl, slotNode, diff.value, diff.index);
                  break;
                case 'delete':
                  this.deleteEl(parentEl, slotNode, diff.index);
                  break;
                case 'set':
                  this.setEl(parentEl, slotNode, diff.value, diff.index);
                  break;
                default:
                  assertUnreachable(diff);
              }
            }),
        );
  }

  // tslint:disable-next-line: prefer-function-over-method
  private deleteEl(parentNode: Node, slotNode: Node, index: number): void {
    const curr = getEl(slotNode, index);

    if (!curr) {
      return;
    }

    parentNode.removeChild(curr);
  }

  private insertEl(
      parentNode: Element,
      slotNode: Node,
      spec: RenderSpec,
      index: number,
  ): void {
    let curr = slotNode.nextSibling;
    for (let i = 0; i < index && curr !== null; i++) {
      curr = curr.nextSibling;
    }

    const newEl = spec.createElement();
    spec.updateElement(newEl);
    parentNode.insertBefore(newEl, curr);
  }

  private setEl(
      parentNode: Element,
      slotNode: Node,
      spec: RenderSpec,
      index: number,
  ): void {
    const existingEl = getEl(slotNode, index);

    if (!(existingEl instanceof HTMLElement) ||
        !spec.canReuseElement(existingEl)) {
      this.deleteEl(parentNode, slotNode, index);
      this.insertEl(parentNode, slotNode, spec, index);

      return;
    }

    spec.updateElement(existingEl);
  }
}

class UnresolvedRepeatedOutput
    implements UnresolvedElementProperty<Element, RepeatedOutput> {
  constructor(
      private readonly slotName: string,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): RepeatedOutput {
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
