import {$filter, $first, $pipe, arrayFrom} from 'gs-tools/export/collect';
import {Observable, Subject} from 'rxjs';
import {map, mapTo, startWith} from 'rxjs/operators';

import {DecoratedElement, __context} from '../core/custom-element-decorator';
import {getSubject, HandlerInput} from '../input/handler';
import {PropertyObserver} from '../input/property-observer';
import {CallerOutput} from '../output/caller';
import {MultiOutput} from '../output/multi';
import {PropertyEmitter} from '../output/property-emitter';
import {SingleOutput} from '../output/single';
import {PropertySpecs} from '../selector/property-spec';
import {Resolver} from '../types/resolver';
import {Selectable} from '../types/selectable';
import {Selector} from '../types/selector';
import {mutationObservable} from '../util/mutation-observable';


export class ElementTester<T extends HTMLElement = HTMLElement> {
  constructor(readonly element: T) { }

  getChildren(elementSelector: Selector<Element, PropertySpecs<Element>>): Observable<readonly Node[]> {
    const el = resolveSelectable(this.element, context => elementSelector.getSelectable(context));
    return mutationObservable(el, {childList: true}).pipe(
        startWith({}),
        mapTo(el),
        map(el => {
          const children: Element[] = [];
          for (let i = 0; i < el.childElementCount; i++) {
            const child = el.children.item(i);
            if (child) {
              children.push(child);
            }
          }

          return children;
        }),
    );
  }

  getNodesAfter(
      output: MultiOutput|SingleOutput,
  ): readonly Node[] {
    const parentEl = resolveSelectable(this.element, context => output.resolver(context));
    const slotEl = findCommentNode(arrayFrom(parentEl.childNodes), output.slotName);
    if (!slotEl) {
      throw new Error(`Slot ${output.slotName} cannot be found`);
    }
    const nodes = [];
    let node = slotEl.nextSibling;
    while (node) {
      nodes.push(node);
      node = node.nextSibling;
    }

    return nodes;
  }

  getObserver<T>(input: PropertyObserver<T>|PropertyEmitter<T>): Observable<T> {
    const el = resolveSelectable(this.element, context => input.resolver(context));
    return (el as any)[input.propertyName] as Observable<T>;
  }

  nextValue<T>(
      input: PropertyObserver<T>|PropertyEmitter<T>,
      value: T,
  ): void {
    const el = resolveSelectable(this.element, context => input.resolver(context));
    const subject = (el as any)[input.propertyName];
    if (!(subject instanceof Subject)) {
      throw new Error(`Property ${input.propertyName} is not a Subject`);
    }

    subject.next(value);
  }

  spyOnFunction(
      outputInput: CallerOutput<unknown[]>|HandlerInput,
  ): Observable<readonly unknown[]> {
    const el = resolveSelectable(this.element, context => outputInput.resolver(context));
    const subject = getSubject(el, outputInput.functionName);
    if (!subject) {
      throw new Error(`Subject for ${outputInput.functionName} not found`);
    }

    return subject;
  }
}


function findCommentNode(
    childNodes: readonly Node[],
    commentContent: string|null,
): Node|null {
  if (!commentContent) {
    return null;
  }

  return $pipe(
      childNodes,
      $filter(node => {
        return node.nodeName === '#comment'
            && !!node.nodeValue
            && node.nodeValue.trim() === commentContent;
      }),
      $first(),
  ) || null;
}

function resolveSelectable<S extends Selectable>(
    element: DecoratedElement,
    resolver: Resolver<S>,
): S {
  const context = element[__context];
  if (!context) {
    throw new Error(`Context for element ${element} not found`);
  }
  return resolver(context);
}
