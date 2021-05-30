import {Vine} from 'grapevine';
import {$asArray, $asMap, $filter, $filterNonNull, $first, $map, $pipe, arrayFrom} from 'gs-tools/export/collect';
import {Verbosity, stringify} from 'moirai';
import {Observable, Subject, fromEvent} from 'rxjs';
import {map, mapTo, startWith} from 'rxjs/operators';

import {DecoratedElement, __context} from '../core/custom-element-decorator';
import {AttributeInput} from '../input/attribute';
import {HandlerInput, getSubject} from '../input/handler';
import {HasAttributeInput} from '../input/has-attribute';
import {HasClassInput} from '../input/has-class';
import {OnDomInput} from '../input/on-dom';
import {OnInputInput} from '../input/on-input';
import {PropertyObserver} from '../input/property-observer';
import {AttributeOutput} from '../output/attribute';
import {CallerOutput} from '../output/caller';
import {ClassToggleOutput} from '../output/class-toggle';
import {DispatcherOutput} from '../output/dispatcher';
import {MultiOutput} from '../output/multi';
import {PropertyEmitter} from '../output/property-emitter';
import {SetAttributeOutput} from '../output/set-attribute';
import {SingleOutput} from '../output/single';
import {StyleOutput} from '../output/style';
import {PropertySpecs} from '../selector/property-spec';
import {Resolver} from '../types/resolver';
import {Selectable} from '../types/selectable';
import {Selector} from '../types/selector';
import {attributeObservable} from '../util/attribute-observable';
import {mutationObservable} from '../util/mutation-observable';


interface Key {
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly key: string;
  readonly meta?: boolean;
  readonly shift?: boolean;
}


export class ElementTester<T extends HTMLElement = HTMLElement> {
  constructor(
      readonly element: T,
      readonly vine: Vine,
  ) { }

  addSlotElement(input: Selector<HTMLSlotElement, PropertySpecs<HTMLSlotElement>>, node: Node): void {
    const slotEl = resolveSelectable(this.element, context => input.getSelectable(context));
    this.element.appendChild(node);
    slotEl.dispatchEvent(new CustomEvent('slotchange'));
  }

  callFunction(input: HandlerInput, args: readonly unknown[]): void {
    const el = resolveSelectable(this.element, context => input.resolver(context));
    (el as any)[input.functionName](...args);
  }

  dispatchEvent<E extends Event>(
      spec: OnDomInput<E>|DispatcherOutput<E>|OnInputInput,
      event: E,
  ): void;
  dispatchEvent(
      spec: OnDomInput<Event>|DispatcherOutput<Event>|OnInputInput,
  ): void;
  dispatchEvent(
      spec: OnDomInput<Event>|OnInputInput,
      event?: Event,
  ): void {
    const eventName = spec instanceof OnInputInput ? 'input' : spec.eventName;
    const normalizedEvent = event || new CustomEvent(eventName);
    const targetEl = resolveSelectable(this.element, context => spec.resolver(context));
    targetEl.dispatchEvent(normalizedEvent);
  }

  flattenContent(): Element {
    return flattenNodeWithShadow(this.element, new Map()) as Element;
  }

  getAttribute<T>(output: AttributeOutput<T>|AttributeInput<T>): Observable<T> {
    const targetEl = resolveSelectable(this.element, context => output.resolver(context));
    return attributeObservable(targetEl, output.attrName).pipe(
        map(() => {
          const strValue = targetEl.getAttribute(output.attrName);
          const value = output.parser.convertBackward(strValue || '');
          if (!value.success) {
            if (output.defaultValue !== undefined) {
              return output.defaultValue;
            }

            throw new Error(
                `Value ${stringify(strValue, Verbosity.DEBUG)} is the wrong type for `
                + `${stringify(output, Verbosity.DEBUG)}`,
            );
          }

          return value.result;
        }),
    );
  }

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

  getClassList(input: Selector<Element, PropertySpecs<Element>>): ReadonlySet<string> {
    const el = resolveSelectable(this.element, context => input.getSelectable(context));
    const classList = el.classList;
    const classes = new Set<string>();
    for (let i = 0; i < classList.length; i++) {
      const classItem = classList.item(i);
      if (!classItem) {
        continue;
      }
      classes.add(classItem);
    }

    return new Set(classes);
  }

  getElement<E extends Selectable>(selector: Selector<E, any>): E {
    return resolveSelectable(this.element, context => selector.getSelectable(context));
  }

  getEvents<E extends Event>(dispatcher: DispatcherOutput<E>): Observable<E> {
    const element = resolveSelectable(this.element, context => dispatcher.resolver(context));
    return fromEvent<E>(element, dispatcher.eventName);
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

  getStyle<S extends keyof CSSStyleDeclaration>(output: StyleOutput<S>): CSSStyleDeclaration[S] {
    const targetEl = resolveSelectable(this.element, context => output.resolver(context));
    return targetEl.style[output.styleKey];
  }

  getTextContent(input: Selector<Element, PropertySpecs<Element>>): string {
    const el = resolveSelectable(this.element, context => input.getSelectable(context));
    return el.textContent || '';
  }

  hasAttribute(
      spec: SetAttributeOutput|HasAttributeInput,
  ): boolean {
    const el = resolveSelectable(this.element, context => spec.resolver(context));
    return el.hasAttribute(spec.attrName);
  }

  hasClass(ioutput: ClassToggleOutput|HasClassInput): boolean {
    const el = resolveSelectable(this.element, context => ioutput.resolver(context));
    return el.classList.contains(ioutput.className);
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

  setAttribute<T>(input: AttributeInput<T>|AttributeOutput<T>, value: T): void {
    const result = input.parser.convertForward(value);
    if (!result.success) {
      throw new Error(`Invalid value: ${value}`);
    }

    const targetEl = resolveSelectable(this.element, context => input.resolver(context));
    targetEl.setAttribute(input.attrName, result.result);
  }

  setHasAttribute(output: SetAttributeOutput|HasAttributeInput, value: boolean): void {
    const targetEl = resolveSelectable(this.element, context => output.resolver(context));
    if (value) {
      targetEl.setAttribute(output.attrName, '');
    } else {
      targetEl.removeAttribute(output.attrName);
    }
  }

  setInputValue(selector: Selector<HTMLInputElement, PropertySpecs<HTMLInputElement>>, value: string): void {
    const targetEl = resolveSelectable(this.element, context => selector.getSelectable(context));
    targetEl.value = value;
    targetEl.dispatchEvent(new CustomEvent('input'));
  }

  setText(selector: Selector<Element, PropertySpecs<Element>>, value: string): void {
    const el = resolveSelectable(this.element, context => selector.getSelectable(context));
    el.textContent = value;
    el.dispatchEvent(
        new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record: []}}),
    );
  }

  simulateKeypress(selector: Selector<Element, PropertySpecs<Element>>, keys: readonly Key[]): void {
    const targetEl = resolveSelectable(this.element, context => selector.getSelectable(context));
    for (const {key, alt, ctrl, meta, shift} of keys) {
      const keydownEvent = new KeyboardEvent('keydown', {
        altKey: alt,
        ctrlKey: ctrl,
        key,
        metaKey: meta,
        shiftKey: shift,
      });
      targetEl.dispatchEvent(keydownEvent);

      const keyupEvent = new KeyboardEvent('keyup', {
        altKey: alt,
        ctrlKey: ctrl,
        key,
        metaKey: meta,
        shiftKey: shift,
      });
      targetEl.dispatchEvent(keyupEvent);
    }
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

function flattenNodeWithShadow(origNode: Node, ancestorSlotMap: ReadonlyMap<string, Node>): Node {
  if (origNode instanceof Element && origNode.tagName === 'SLOT') {
    const slotName = origNode.getAttribute('name') ?? '';
    const slotEl = origNode.cloneNode();
    const slotContentEl = ancestorSlotMap.get(slotName);
    if (slotContentEl) {
      slotEl.appendChild(slotContentEl);
      return slotEl;
    }
  }

  const shadowRoot = origNode instanceof Element ? origNode.shadowRoot : null;
  const rootEl = origNode.cloneNode();
  if (shadowRoot === null) {
    const children = $pipe(
        arrayFrom(origNode.childNodes),
        $map(child => flattenNodeWithShadow(child, ancestorSlotMap)),
        $asArray(),
    );
    for (const child of children) {
      rootEl.appendChild(child);
    }
    return rootEl;
  }

  const slotMap = $pipe(
      arrayFrom(origNode.childNodes),
      $map(child => {
        if (!(child instanceof Element)) {
          return null;
        }

        const slotName = child.getAttribute('slot') ?? '';
        return [slotName ?? '', flattenNodeWithShadow(child, ancestorSlotMap)] as const;
      }),
      $filterNonNull(),
      $asMap(),
  );

  // Add shadowRoot's children
  const children = $pipe(
      arrayFrom(shadowRoot.childNodes),
      $map(child => flattenNodeWithShadow(child, slotMap)),
      $asArray(),
  );
  for (const child of children) {
    rootEl.appendChild(child);
  }
  return rootEl;
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
