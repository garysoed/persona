import { InstanceSourceId, InstanceStreamId } from '@grapevine/component';
import { VineBuilder, VineImpl } from '@grapevine/main';
import { fake, spy } from '@gs-testing/spy';
import { createImmutableList, createImmutableSet, ImmutableList, ImmutableSet } from '@gs-tools/collect';
import { Errors } from '@gs-tools/error';
import { stringify, Verbosity } from 'moirai/export';
import { Observable, throwError, timer } from 'rxjs';
import { filter, map, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { Input } from '../component/input';
import { AttributeInput, UnresolvedAttributeInput } from '../input/attribute';
import { HandlerInput } from '../input/handler';
import { HasAttributeInput } from '../input/has-attribute';
import { HasClassInput } from '../input/has-class';
import { MediaQueryInput } from '../input/media-query';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { __ctrl, ElementWithCtrl } from '../main/custom-element-impl';
import { CustomElementCtrlCtor } from '../main/persona';
import { PersonaBuilder } from '../main/persona-builder';
import { AttributeOutput } from '../output/attribute';
import { ClassToggleOutput } from '../output/class-toggle';
import { SetAttributeOutput } from '../output/set-attribute';
import { findCommentNode, SlotOutput } from '../output/slot';
import { StyleOutput } from '../output/style';
import { FakeCustomElementRegistry } from './fake-custom-element-registry';
import { FakeMediaQuery, mockMatchMedia } from './mock-match-media';

interface Key {
  alt?: boolean;
  ctrl?: boolean;
  key: string;
  meta?: boolean;
  shift?: boolean;
}

const REFRESH_PERIOD_MS = 10;

/**
 * Used to test UI implemented using Persona.
 */
export class PersonaTester {
  constructor(
      readonly vine: VineImpl,
      private readonly customElementRegistry_: FakeCustomElementRegistry,
  ) { }

  callFunction<A extends any[]>(
      element: ElementWithCtrl,
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
    return this.customElementRegistry_.create(tag, parent);
  }

  dispatchEvent(
      element: ElementWithCtrl,
      input: Input<Element>,
      event: Event,
  ): Observable<unknown> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot))
        .pipe(
            take(1),
            tap(targetEl => targetEl.dispatchEvent(event)),
        );
  }

  getAttribute<T>(
      element: ElementWithCtrl,
      output: AttributeOutput<T>|AttributeInput<T>,
  ): Observable<T> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
            switchMap(targetEl => timer(0, REFRESH_PERIOD_MS).pipe(mapTo(targetEl))),
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
      element: ElementWithCtrl,
      output: Input<Element>,
  ): Observable<ImmutableSet<string>> {
    return getElement(element, shadowRoot => output.getValue(shadowRoot))
        .pipe(
            switchMap(targetEl => timer(0, REFRESH_PERIOD_MS).pipe(mapTo(targetEl))),
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

              return createImmutableSet(classes);
            }),
        );
  }

  getElement<E extends Element>(
      element: ElementWithCtrl,
      input: Input<E>,
  ): Observable<E> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot));
  }

  getHasClass(
      element: ElementWithCtrl,
      ioutput: ClassToggleOutput|HasClassInput,
  ): Observable<boolean> {
    return getElement(element, shadowRoot => ioutput.resolver(shadowRoot))
        .pipe(
            switchMap(el => timer(0, REFRESH_PERIOD_MS)
                .pipe(map(() => el.classList.contains(ioutput.className)))),
        );
  }

  getNodesAfter(
      element: ElementWithCtrl,
      output: SlotOutput<any, any>,
  ): Observable<ImmutableList<Node>> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
            map(parentEl => findCommentNode(
                createImmutableList(parentEl.childNodes),
                output.slotName,
            )),
            switchMap(slotEl => {
              if (!slotEl) {
                return throwError(new Error(`Slot ${output.slotName} cannot be found`));
              }

              return timer(0, REFRESH_PERIOD_MS).pipe(mapTo(slotEl));
            }),
            map(slotEl => {
              const nodes = [];
              let node = slotEl.nextSibling;
              while (node) {
                nodes.push(node);
                node = node.nextSibling;
              }

              return createImmutableList(nodes);
            }),
        );
  }

  getObservable<T>(
      element: ElementWithCtrl,
      id: InstanceSourceId<T>|InstanceStreamId<T>,
  ): Observable<T> {
    const obs = this.vine.getObservable(id, getCtrl(element));
    if (!obs) {
      throw new Error(`Observable for ${id} not found`);
    }

    return obs;
  }

  getStyle<S extends keyof CSSStyleDeclaration>(
      element: ElementWithCtrl,
      output: StyleOutput<S>,
  ): Observable<CSSStyleDeclaration[S]> {
    return getElement(element, shadowRoot => output.resolver(shadowRoot))
        .pipe(
            switchMap(element => timer(0, REFRESH_PERIOD_MS).pipe(mapTo(element))),
            map(targetEl => targetEl.style[output.styleKey]),
        );
  }

  getTextContent(
      element: ElementWithCtrl,
      input: Input<Element>,
  ): Observable<string> {
    return getElement(element, shadowRoot => input.getValue(shadowRoot))
        .pipe(
            switchMap(targetEl => timer(0, REFRESH_PERIOD_MS).pipe(mapTo(targetEl))),
            map(el => el.textContent || ''));
  }

  setAttribute<T>(
      element: ElementWithCtrl,
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
            switchMap(() => this.vine.getObservable(input.id, getCtrl(element))),
            filter(setValue => {
              const setResult = input.parser.convertForward(setValue);

              return setResult.success && setResult.result === result.result;
            }),
            take(1),
        );
  }

  setHasAttribute(
      element: ElementWithCtrl,
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
      element: ElementWithCtrl,
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
      element: ElementWithCtrl,
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
      private readonly vineBuilder_: VineBuilder,
      private readonly personaBuilder_: PersonaBuilder,
  ) { }

  build(rootCtors: CustomElementCtrlCtor[]): PersonaTester {
    // tslint:disable-next-line: deprecation
    const origCreateElement = document.createElement;
    const createElement = (tag: string) => origCreateElement.call(document, tag);
    const customElementRegistry = new FakeCustomElementRegistry(createElement);

    const {vine} = this.personaBuilder_.build(rootCtors, customElementRegistry, this.vineBuilder_);

    const tester = new PersonaTester(vine, customElementRegistry);
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

function getCtrl(element: ElementWithCtrl): CustomElementCtrl {
  const ctrl = element[__ctrl];
  if (!ctrl) {
    throw new Error(`ctrl for element ${element} not found`);
  }

  return ctrl;
}

function getElement<E extends Element>(
    element: ElementWithCtrl,
    resolver: (root: ShadowRoot) => Observable<E>,
): Observable<E> {
  const shadowRoot = getShadowRoot(element);

  return resolver(shadowRoot);
}

function getShadowRoot(element: ElementWithCtrl): ShadowRoot {
  const shadowRoot = element.shadowRoot;
  if (!shadowRoot) {
    throw new Error(`ShadowRoot for element ${element} not found`);
  }

  return shadowRoot;
}
