import { Vine } from 'grapevine';
import { $filter, $first, $pipe, arrayFrom } from 'gs-tools/export/collect';
import { stringify, Verbosity } from 'moirai';
import { fromEvent, Observable, Subject } from 'rxjs';
import { map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { __context, DecoratedElement } from '../core/custom-element-decorator';
import { PersonaContext } from '../core/persona-context';
import { AttributeInput } from '../input/attribute';
import { getSubject, HandlerInput } from '../input/handler';
import { HasAttributeInput } from '../input/has-attribute';
import { HasClassInput } from '../input/has-class';
import { OnDomInput } from '../input/on-dom';
import { OnInputInput } from '../input/on-input';
import { PropertyObserver } from '../input/property-observer';
import { RepeatedOutput } from '../main/repeated';
import { SingleOutput } from '../main/single';
import { AttributeOutput } from '../output/attribute';
import { CallerOutput } from '../output/caller';
import { ClassToggleOutput } from '../output/class-toggle';
import { DispatcherOutput, UnresolvedDispatcherOutput } from '../output/dispatcher';
import { PropertyEmitter } from '../output/property-emitter';
import { SetAttributeOutput } from '../output/set-attribute';
import { StyleOutput } from '../output/style';
import { Input } from '../types/input';


interface Key {
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly key: string;
  readonly meta?: boolean;
  readonly shift?: boolean;
}

export class BaseElementTester<T extends HTMLElement = HTMLElement> {
  constructor(
      readonly element$: Observable<T>,
      readonly vine: Vine,
  ) { }

  callFunction(
      input: HandlerInput,
      args: readonly unknown[],
  ): Observable<unknown> {
    return this.element$
        .pipe(
            getElement(context => input.resolver(context)),
            tap(el => (el as any)[input.functionName](...args)),
            take(1),
        );
  }

  dispatchEvent<E extends Event>(
      spec: OnDomInput<E>|DispatcherOutput<E>|OnInputInput,
      event: E,
  ): Observable<unknown>;
  dispatchEvent(
      spec: OnDomInput<Event>|DispatcherOutput<Event>|OnInputInput,
  ): Observable<unknown>;
  dispatchEvent(
      spec: OnDomInput<Event>|OnInputInput,
      event?: Event,
  ): Observable<unknown> {
    const eventName = spec instanceof OnInputInput ? 'input' : spec.eventName;
    const normalizedEvent = event || new CustomEvent(eventName);
    return this.element$
        .pipe(
            getElement(context => spec.resolver(context)),
            tap(targetEl => targetEl.dispatchEvent(normalizedEvent)),
            take(1),
        );
  }

  forwardEmissions<T>(
      input: PropertyObserver<T>|PropertyEmitter<T>,
      value$: Observable<T>,
  ): Observable<unknown> {
    const subject$ = this.element$.pipe(
        getElement(context => input.resolver(context)),
        take(1),
        map(el => {
          const subject = (el as any)[input.propertyName];
          if (!(subject instanceof Subject)) {
            throw new Error(`Property ${input.propertyName} is not a Subject`);
          }
          return subject;
        }),
    );

    return value$.pipe(
        withLatestFrom(subject$),
        tap(([value, subject]) => {
          subject.next(value);
        }),
    );
  }

  getAttribute<T>(output: AttributeOutput<T>|AttributeInput<T>): Observable<T> {
    return this.element$
        .pipe(
            getElement(context => output.resolver(context)),
            map(targetEl => {
              const strValue = targetEl.getAttribute(output.attrName);
              const value = output.parser.convertBackward(strValue || '');
              if (!value.success) {
                if (output.defaultValue !== undefined) {
                  return output.defaultValue;
                }

                throw new Error(
                    `Value ${stringify(strValue, Verbosity.DEBUG)} is the wrong type for ` +
                    `${stringify(output, Verbosity.DEBUG)}`,
                );
              }

              return value.result;
            }),
        );
  }

  getClassList(input: Input<Element>): Observable<Set<string>> {
    return this.element$
        .pipe(
            getElement(shadowRoot => input.getValue(shadowRoot)),
            map(el => {
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
            }),
        );
  }

  getElement<E extends Element>(
      input: Input<E>,
  ): Observable<E> {
    return this.element$.pipe(getElement(context => input.getValue(context)));
  }

  getEvents<E extends Event>(
      dispatcher: UnresolvedDispatcherOutput<E>|DispatcherOutput<E>,
  ): Observable<E> {
    return this.element$.pipe(
        switchMap(element => fromEvent<E>(element, dispatcher.eventName)),
    );
  }

  getHasClass(
      ioutput: ClassToggleOutput|HasClassInput,
  ): Observable<boolean> {
    return this.element$
        .pipe(
            getElement(context => ioutput.resolver(context)),
            map(el => el.classList.contains(ioutput.className)),
        );
  }

  getNodesAfter(
      output: RepeatedOutput|SingleOutput,
  ): Observable<Node[]> {
    return this.element$
        .pipe(
            getElement(context => output.resolver(context)),
            map(parentEl => findCommentNode(
                arrayFrom(parentEl.childNodes),
                output.slotName,
            )),
            map(slotEl => {
              if (!slotEl) {
                throw new Error(`Slot ${output.slotName} cannot be found`);
              }

              return slotEl;
            }),
            map(slotEl => {
              const nodes = [];
              let node = slotEl.nextSibling;
              while (node) {
                nodes.push(node);
                node = node.nextSibling;
              }

              return nodes;
            }),
        );
  }

  getObserver<T>(input: PropertyObserver<T>|PropertyEmitter<T>): Observable<T> {
    return this.element$.pipe(
        getElement(context => input.resolver(context)),
        switchMap(el => (el as any)[input.propertyName] as Observable<T>),
    );
  }

  getStyle<S extends keyof CSSStyleDeclaration>(
      output: StyleOutput<S>,
  ): Observable<CSSStyleDeclaration[S]> {
    return this.element$
        .pipe(
            getElement(context => output.resolver(context)),
            map(targetEl => targetEl.style[output.styleKey]),
        );
  }

  getTextContent(
      input: Input<Element>,
  ): Observable<string> {
    return this.element$
        .pipe(
            getElement(context => input.getValue(context)),
            map(el => el.textContent || ''),
        );
  }

  hasAttribute(
      spec: SetAttributeOutput|HasAttributeInput,
  ): Observable<boolean> {
    return this.element$
        .pipe(
            getElement(context => spec.resolver(context)),
            map(el => el.hasAttribute(spec.attrName)),
        );
  }

  // TODO: The inputs should take unresolved values too.
  setAttribute<T>(
      input: AttributeInput<T>,
      value: T,
  ): Observable<unknown> {
    const result = input.parser.convertForward(value);
    if (!result.success) {
      throw new Error(`Invalid value: ${value}`);
    }

    return this.element$
        .pipe(
            getElement(context => input.resolver(context)),
            tap(targetEl => {
              targetEl.setAttribute(input.attrName, result.result);
            }),
            take(1),
        );
  }

  setHasAttribute(
      output: SetAttributeOutput|HasAttributeInput,
      value: boolean,
  ): Observable<unknown> {
    return this.element$
        .pipe(
            getElement(context => output.resolver(context)),
            take(1),
            tap(targetEl => {
              if (value) {
                targetEl.setAttribute(output.attrName, '');
              } else {
                targetEl.removeAttribute(output.attrName);
              }
            }),
        );
  }

  setInputValue(
      input: Input<HTMLInputElement>,
      value: string,
  ): Observable<unknown> {
    return this.element$
        .pipe(
            getElement(context => input.getValue(context)),
            take(1),
            tap(targetEl => {
              targetEl.value = value;
              targetEl.dispatchEvent(new CustomEvent('input'));
            }),
        );
  }

  simulateKeypress(
      input: Input<Element>,
      keys: Key[],
  ): Observable<unknown> {
    return this.element$
        .pipe(
            getElement(context => input.getValue(context)),
            tap(targetEl => {
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
            }),
        );
  }

  spyOnFunction(
      outputInput: CallerOutput<unknown[]>|HandlerInput,
  ): Observable<readonly unknown[]> {
    return this.element$
        .pipe(
            getElement(context => outputInput.resolver(context)),
            switchMap(el => {
              const subject = getSubject(el, outputInput.functionName);
              if (!subject) {
                throw new Error(`Subject for ${outputInput.functionName} not found`);
              }

              return subject;
            }),
        );
  }
}

function findCommentNode<R>(
    childNodes: readonly Node[],
    commentContent: string|null,
): Node|null {
  if (!commentContent) {
    return null;
  }

  return $pipe(
      childNodes,
      $filter(node => {
        return node.nodeName === '#comment' &&
            !!node.nodeValue &&
            node.nodeValue.trim() === commentContent;
      }),
      $first(),
  ) || null;
}

function getElement<E extends Element>(
    resolver: (context: PersonaContext) => Observable<E>,
): (source: Observable<HTMLElement>) => Observable<E> {
  return switchMap(element => {
    return resolver(getContext(element));
  });
}

function getContext(element: DecoratedElement): PersonaContext {
  const context = element[__context];
  if (!context) {
    throw new Error(`Context for element ${element} not found`);
  }

  return context;
}
