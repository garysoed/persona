import { $filter, $head, $pipe, createImmutableList, ImmutableList } from '@gs-tools/collect';
import { filterNonNull } from '@gs-tools/rxjs';
import { assertUnreachable } from '@gs-tools/typescript';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { mutationObservable } from '../util/mutation-observable';

interface ArrayInit<T> {
  payload: T[];
  type: 'init';
}

interface ArrayInsert<T> {
  index: number;
  payload: T;
  type: 'insert';
}

interface ArrayDelete {
  index: number;
  type: 'delete';
}

interface ArraySet<T> {
  index: number;
  payload: T;
  type: 'set';
}

export type ArrayDiff<T> = ArrayInit<T>|ArrayInsert<T>|ArrayDelete|ArraySet<T>;

interface Payload {
  [key: string]: string;
}

export class RepeatedOutput<T extends Payload> implements Output<ArrayDiff<T>> {
  constructor(
      readonly slotName: string,
      readonly tagName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  // tslint:disable-next-line: prefer-function-over-method
  private deleteEl(parentNode: Node, slotNode: Node, index: number): void {
    const curr = getEl(slotNode, index);

    if (!curr) {
      return;
    }

    parentNode.removeChild(curr);
  }

  private insertEl(parentNode: Node, slotNode: Node, payload: T, index: number): void {
    let curr = slotNode.nextSibling;
    for (let i = 0; i < index && curr !== null; i++) {
      curr = curr.nextSibling;
    }

    const newEl = document.createElement(this.tagName);
    applyAttributes(newEl, payload);
    parentNode.insertBefore(newEl, curr);
  }

  output(root: ShadowRoot, valueObs: Observable<ArrayDiff<T>>): Observable<unknown> {
    const parentElObs = this.resolver(root);

    return valueObs
        .pipe(
            withLatestFrom(
                parentElObs,
                createCommentNodeObs(parentElObs, this.slotName).pipe(filterNonNull()),
            ),
            tap(([diff, parentEl, slotNode]) => {
              switch (diff.type) {
                case 'init':
                  for (let i = 0; i < diff.payload.length; i++) {
                    this.insertEl(parentEl, slotNode, diff.payload[i], i);
                  }
                  break;
                case 'insert':
                  this.insertEl(parentEl, slotNode, diff.payload, diff.index);
                  break;
                case 'delete':
                  this.deleteEl(parentEl, slotNode, diff.index);
                  break;
                case 'set':
                  this.setEl(parentEl, slotNode, diff.payload, diff.index);
                  break;
                default:
                  assertUnreachable(diff);
              }
            }),
        );
  }

  private setEl(parentNode: Node, slotNode: Node, payload: T, index: number): void {
    const existingEl = getEl(slotNode, index);

    if (!(existingEl instanceof HTMLElement) ||
        existingEl.tagName.toLowerCase() !== this.tagName) {
      this.deleteEl(parentNode, slotNode, index);
      this.insertEl(parentNode, slotNode, payload, index);

      return;
    }

    applyAttributes(existingEl, payload);
  }
}

class UnresolvedRepeatedOutput<T extends Payload>
    implements UnresolvedElementProperty<Element, RepeatedOutput<T>> {
  constructor(
      private readonly slotName: string,
      private readonly tagName: string,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): RepeatedOutput<T> {
    return new RepeatedOutput(this.slotName, this.tagName, resolver);
  }
}

export function repeated<T extends Payload>(
    slotName: string,
    tagName: string,
): UnresolvedRepeatedOutput<T> {
  return new UnresolvedRepeatedOutput<T>(slotName, tagName);
}

function applyAttributes(element: HTMLElement, payload: Payload): void {
  for (const key in payload) {
    if (!payload.hasOwnProperty(key)) {
      continue;
    }

    element.setAttribute(key, payload[key]);
  }
}

function createCommentNodeObs(
    parentElObs: Observable<Element>,
    slotName: string,
): Observable<Node|null> {
  return parentElObs
      .pipe(
          switchMap(parentEl => {
            return mutationObservable(parentEl, {childList: true})
                .pipe(
                    map(() => parentEl.childNodes),
                    startWith(parentEl.childNodes),
                );
          }),
          map(childNodes => findCommentNode(createImmutableList(childNodes), slotName)),
      );
}

function findCommentNode(
    childNodes: ImmutableList<Node>,
    commentContent: string,
): Node|null {
  return $pipe(
      childNodes,
      $filter(node => {
        return node.nodeName === '#comment' &&
            !!node.nodeValue &&
            node.nodeValue.trim() === commentContent;
      }),
      $head(),
  ) || null;
}

function getEl(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}
