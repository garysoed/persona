import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { assertUnreachable } from '@gs-tools/typescript';
import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { applyAttributes, applyInnerText, AttributesSpec, createElementFromSpec } from './create-element-from-spec';
import { createSlotObs } from './create-slot-obs';

type Payload = Map<string, string>;

export interface RepeatedSpec {
  attr?: AttributesSpec;
  innerText?: string;
}

export class RepeatedOutput implements Output<ArrayDiff<RepeatedSpec>> {
  constructor(
      readonly slotName: string,
      readonly tagName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<ArrayDiff<RepeatedSpec>>): Observable<unknown> {
    const parentElObs = this.resolver(root);

    return valueObs
        .pipe(
            withLatestFrom(
                parentElObs,
                createSlotObs(parentElObs, this.slotName).pipe(filterNonNull()),
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
      spec: RepeatedSpec,
      index: number,
  ): void {
    let curr = slotNode.nextSibling;
    for (let i = 0; i < index && curr !== null; i++) {
      curr = curr.nextSibling;
    }

    const newEl = createElementFromSpec(this.tagName, spec.attr || new Map(), spec.innerText || '');
    parentNode.insertBefore(newEl, curr);
  }

  private setEl(
      parentNode: Element,
      slotNode: Node,
      spec: RepeatedSpec,
      index: number,
  ): void {
    const existingEl = getEl(slotNode, index);

    if (!(existingEl instanceof HTMLElement) ||
        existingEl.tagName.toLowerCase() !== this.tagName) {
      this.deleteEl(parentNode, slotNode, index);
      this.insertEl(parentNode, slotNode, spec, index);

      return;
    }

    applyAttributes(existingEl, spec.attr || new Map());
    applyInnerText(existingEl, spec.innerText || '');
  }
}

class UnresolvedRepeatedOutput<T extends Payload>
    implements UnresolvedElementProperty<Element, RepeatedOutput> {
  constructor(
      private readonly slotName: string,
      private readonly tagName: string,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): RepeatedOutput {
    return new RepeatedOutput(this.slotName, this.tagName, resolver);
  }
}

export function repeated<T extends Payload>(
    slotName: string,
    tagName: string,
): UnresolvedRepeatedOutput<T> {
  return new UnresolvedRepeatedOutput<T>(slotName, tagName);
}

function getEl(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}
