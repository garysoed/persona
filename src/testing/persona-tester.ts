import { Vine } from '@grapevine';
import { fake, spy } from '@gs-testing';
import { $filter, $head, $pipe, createImmutableList, ImmutableList } from '@gs-tools/collect';
import { Errors } from '@gs-tools/error';
import { stringify, Verbosity } from '@moirai';
import { Observable } from '@rxjs';
import { map, take, tap } from '@rxjs/operators';
import { Builder as PersonaBuilder } from '../core/builder';
import { AttributeInput } from '../input/attribute';
import { HandlerInput } from '../input/handler';
import { HasAttributeInput } from '../input/has-attribute';
import { HasClassInput } from '../input/has-class';
import { MediaQueryInput } from '../input/media-query';
import { OnDomInput } from '../input/on-dom';
import { RepeatedOutput } from '../main/repeated';
import { SingleOutput } from '../main/single';
import { AttributeOutput } from '../output/attribute';
import { ClassToggleOutput } from '../output/class-toggle';
import { DispatcherOutput } from '../output/dispatcher';
import { SetAttributeOutput } from '../output/set-attribute';
import { StyleOutput } from '../output/style';
import { CustomElementCtrlCtor } from '../types/custom-element-ctrl';
import { Input } from '../types/input';
import { FakeCustomElementRegistry } from './fake-custom-element-registry';
import { FakeTime } from './fake-time';
import { FakeMediaQuery, mockMatchMedia } from './mock-match-media';

interface Key {
  alt?: boolean;
  ctrl?: boolean;
  key: string;
  meta?: boolean;
  shift?: boolean;
}

/**
 * Used to test UI implemented using Persona.
 */
export class PersonaTester {
  constructor(
      readonly vine: Vine,
      readonly time: FakeTime,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  callFunction<A extends any[]>(
      element: HTMLElement,
      input: HandlerInput<A>,
      args: A,
  ): Observable<unknown> {
    return getElement(element, shadowRoot => input.resolver(shadowRoot))
        .pipe(
            take(1),
            tap(el => (el as any)[input.functionName](...args)),
        );
  }

  createElement(tag: string, parent: HTMLElement|null): HTMLElement {
    return this.customElementRegistry.create(tag, parent);
  }

  dispatchEvent<E extends Event>(
      element: HTMLElement,
      spec: OnDomInput<E>|DispatcherOutput<E>,
      event: E,
  ): Observable<unknown>;
  dispatchEvent(
      element: HTMLElement,
      spec: OnDomInput<Event>|DispatcherOutput<Event>,
  ): Observable<unknown>;
  dispatchEvent(
      element: HTMLElement,
      spec: OnDomInput<Event>,
      event: Event = new CustomEvent(spec.eventName),
  ): Observable<unknown> {
    return getElement(element, shadowRoot => spec.resolver(shadowRoot))
        .pipe(
            take(1),
            tap(targetEl => targetEl.dispatchEvent(event)),
        );
  }

  getAttribute<T>(
      element: HTMLElement,
      output: AttributeOutput<T>|AttributeInput<T>,
  ): Observable<T> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
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

  getClassList(
      element: HTMLElement,
      output: Input<Element>,
  ): Observable<Set<string>> {
    return getElement(element, shadowRoot => output.getValue(shadowRoot))
        .pipe(
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
      element: HTMLElement,
      input: Input<E>,
  ): Observable<E> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot));
  }

  getHasClass(
      element: HTMLElement,
      ioutput: ClassToggleOutput|HasClassInput,
  ): Observable<boolean> {
    return getElement(element, shadowRoot => ioutput.resolver(shadowRoot))
        .pipe(
            map(el => el.classList.contains(ioutput.className)),
        );
  }

  getNodesAfter(
      element: HTMLElement,
      output: RepeatedOutput|SingleOutput,
  ): Observable<Node[]> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
            map(parentEl => findCommentNode(
                createImmutableList(parentEl.childNodes),
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

  getStyle<S extends keyof CSSStyleDeclaration>(
      element: HTMLElement,
      output: StyleOutput<S>,
  ): Observable<CSSStyleDeclaration[S]> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
            map(targetEl => targetEl.style[output.styleKey]),
        );
  }

  getTextContent(
      element: HTMLElement,
      input: Input<Element>,
  ): Observable<string> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot))
        .pipe(map(el => el.textContent || ''));
  }

  hasAttribute(
      element: HTMLElement,
      spec: SetAttributeOutput|HasAttributeInput,
  ): Observable<boolean> {
    return getElement(element, shadowRoot => spec.resolver(shadowRoot))
        .pipe(
            map(el => el.hasAttribute(spec.attrName)),
        );
  }

  setAttribute<T>(
      element: HTMLElement,
      input: AttributeInput<T>,
      value: T,
  ): Observable<unknown> {
    const result = input.parser.convertForward(value);
    if (!result.success) {
      throw new Error(`Invalid value: ${value}`);
    }

    return getElement(element, shadowRoot => input.resolver(shadowRoot))
        .pipe(
            take(1),
            tap(targetEl => {
              targetEl.setAttribute(input.attrName, result.result);
            }),
        );
  }

  setHasAttribute(
      element: HTMLElement,
      output: SetAttributeOutput|HasAttributeInput,
      value: boolean,
  ): Observable<unknown> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
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
      element: HTMLElement,
      input: Input<HTMLInputElement>,
      value: string,
  ): Observable<unknown> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot))
        .pipe(
            take(1),
            tap(targetEl => {
              targetEl.value = value;
              targetEl.dispatchEvent(new CustomEvent('input'));
            }),
        );
  }

  setMedia(input: MediaQueryInput, value: boolean): void {
    const mediaQuery = window.matchMedia(input.query);
    if (!(mediaQuery instanceof FakeMediaQuery)) {
      throw Errors.assert('mediaQuery').shouldBeAnInstanceOf(FakeMediaQuery).butWas(mediaQuery);
    }

    (mediaQuery as FakeMediaQuery).matches = value;
  }

  simulateKeypress(
      element: HTMLElement,
      input: Input<Element>,
      keys: Key[],
  ): Observable<unknown> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot))
        .pipe(
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
}

/**
 * Test UI elements built by Persona.
 *
 * Instantiate the factory once. You will need to call build at the beginning of every test.
 */
export class PersonaTesterFactory {
  constructor(
      private readonly personaBuilder: PersonaBuilder,
  ) { }

  build(rootCtors: CustomElementCtrlCtor[]): PersonaTester {
    // tslint:disable-next-line: deprecation
    const origCreateElement = document.createElement;
    const createElement = (tag: string) => origCreateElement.call(document, tag);
    const customElementRegistry = new FakeCustomElementRegistry(createElement);

    const {vine} = this.personaBuilder.build(
        'test',
        rootCtors,
        customElementRegistry,
    );

    const fakeTime = new FakeTime();
    fakeTime.install(window);

    const tester = new PersonaTester(vine, fakeTime, customElementRegistry);
    fake(spy(document, 'createElement'))
        .always().call(tag => {
          if (customElementRegistry.get(tag)) {
            return tester.createElement(tag, null);
          } else {
            return createElement(tag);
          }
        });

    mockMatchMedia(window);

    return tester;
  }
}

function findCommentNode<R>(
    childNodes: ImmutableList<Node>,
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
      $head(),
  ) || null;
}

function getElement<E extends Element>(
    element: HTMLElement,
    resolver: (root: ShadowRoot) => Observable<E>,
): Observable<E> {
  const shadowRoot = getShadowRoot(element);

  return resolver(shadowRoot);
}

function getShadowRoot(element: HTMLElement): ShadowRoot {
  const shadowRoot = element.shadowRoot;
  if (!shadowRoot) {
    throw new Error(`ShadowRoot for element ${element} not found`);
  }

  return shadowRoot;
}
