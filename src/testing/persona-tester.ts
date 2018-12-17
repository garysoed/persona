import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { fake, spy } from 'gs-testing/export/spy';
import { ImmutableList, ImmutableSet } from 'gs-tools/export/collect';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ResolvedAttributeInLocator } from '../locator/attribute-in-locator';
import { ResolvedAttributeOutLocator } from '../locator/attribute-out-locator';
import { ResolvedClassListLocator } from '../locator/classlist-locator';
import { ResolvedElementLocator } from '../locator/element-locator';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { findCommentNode, ResolvedSlotLocator } from '../locator/slot-locator';
import { ResolvedStyleLocator } from '../locator/style-locator';
import { ResolvedTextContentLocator } from '../locator/text-content-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { __ctrl, ElementWithCtrl } from '../main/custom-element-impl';
import { PersonaBuilder } from '../main/persona-builder';
import { FakeCustomElementRegistry } from './fake-custom-element-registry';

interface Key {
  alt?: boolean;
  ctrl?: boolean;
  key: string;
  meta?: boolean;
  shift?: boolean;
}

export class PersonaTester {
  constructor(
      readonly vine: VineImpl,
      private readonly customElementRegistry_: FakeCustomElementRegistry,
  ) { }

  createElement(tag: string, parent: HTMLElement|null): HTMLElement {
    return this.customElementRegistry_.create(tag, parent);
  }

  dispatchEvent(
      element: ElementWithCtrl,
      locator: ResolvedElementLocator<HTMLElement>,
      event: Event,
  ): void {
    const targetEl = getElement_(element, locator);
    targetEl.dispatchEvent(event);
  }

  getAttribute<T>(
      element: ElementWithCtrl,
      locator: ResolvedAttributeInLocator<T>|ResolvedAttributeOutLocator<T>,
  ): T {
    const targetEl = getElement_(element, locator.elementLocator);
    const strValue = targetEl.getAttribute(locator.attrName);
    const value = locator.parser.convertBackward(strValue || '');
    if (!value.success) {
      throw new Error(`Value ${strValue} is the wrong type for ${locator}`);
    }

    return value.result;
  }

  getClassList(
      element: ElementWithCtrl,
      locator: ResolvedClassListLocator,
  ): ImmutableSet<string> {
    const el = getElement_(element, locator.elementLocator);
    const classList = el.classList;
    const classes = new Set<string>();
    for (let i = 0; i < classList.length; i++) {
      const classItem = classList.item(i);
      if (!classItem) {
        continue;
      }
      classes.add(classItem);
    }

    return ImmutableSet.of(classes);
  }

  getElement<T extends HTMLElement>(
      element: ElementWithCtrl,
      locator: ResolvedElementLocator<T>,
  ): T {
    return getElement_(element, locator);
  }

  getElementsAfter(
      element: ElementWithCtrl,
      locator: ResolvedSlotLocator<unknown, unknown>,
  ): ImmutableList<Node> {
    const parentEl = getElement_(element, locator.parentElementLocator);
    const slotEl = findCommentNode(ImmutableList.of(parentEl.childNodes), locator.slotName);
    if (!slotEl) {
      throw new Error(`Slot ${locator.slotName} cannot be found`);
    }

    const nodes = [];
    let node = slotEl.nextSibling;
    while (node) {
      nodes.push(node);
      node = node.nextSibling;
    }

    return ImmutableList.of(nodes);
  }

  getObservable<T>(
      element: ElementWithCtrl,
      id: InstanceSourceId<T>|InstanceStreamId<T>,
  ): Observable<T> {
    const obs = this.vine.getObservable(id, getCtrl_(element));
    if (!obs) {
      throw new Error(`Observable for ${id} not found`);
    }

    return obs;
  }

  getProperty<E extends HTMLElement, K extends keyof E>(
      element: ElementWithCtrl,
      locator: ResolvedWatchableLocator<E>,
      key: K,
  ): E[K] {
    const targetEl = getElement_(element, locator);

    return targetEl[key];
  }

  getStyle<K extends keyof CSSStyleDeclaration>(
      element: ElementWithCtrl,
      locator: ResolvedStyleLocator<K>,
  ): CSSStyleDeclaration[K] {
    const targetEl = getElement_(element, locator.elementLocator);

    return targetEl.style[locator.styleKey];
  }

  getTextContent(
      element: ElementWithCtrl,
      locator: ResolvedTextContentLocator,
  ): string {
    const targetEl = getElement_(element, locator.elementLocator);

    return targetEl.textContent || '';
  }

  setAttribute<T>(
      element: ElementWithCtrl,
      locator: ResolvedAttributeOutLocator<T>|ResolvedAttributeInLocator<T>,
      value: T,
  ): void {
    const targetEl = getElement_(element, locator.elementLocator);
    const result = locator.parser.convertForward(value);

    if (!result.success) {
      throw new Error(`Invalid value: ${value}`);
    }

    targetEl.setAttribute(locator.attrName, result.result);
  }

  setInputValue(
      element: ElementWithCtrl,
      locator: ResolvedElementLocator<HTMLInputElement>,
      value: string,
  ): void {
    const targetEl = getElement_(element, locator);
    targetEl.value = value;
    targetEl.dispatchEvent(new CustomEvent('input'));
  }

  simulateEvent(
      element: ElementWithCtrl,
      event: Event,
      locator: ResolvedWatchableLocator<Element>,
  ): void {
    const targetEl = getElement_(element, locator);

    if (!(targetEl instanceof HTMLElement)) {
      throw new Error(`Element ${targetEl} is not an HTMLElement`);
    }
    targetEl.dispatchEvent(event);
  }

  simulateKeypress(
      element: ElementWithCtrl,
      locator: ResolvedWatchableLocator<Element>,
      keys: Key[],
  ): void {
    const targetEl = getElement_(element, locator);
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

  waitForValue<T>(
      locator: ResolvedWatchableLocator<T>,
      element: ElementWithCtrl,
      expectedValue: T,
  ): Promise<unknown> {
    return this.vine.getObservable(locator.getReadingId(), getCtrl_(element))
        .pipe(
            filter(currentValue => currentValue === expectedValue),
            take(1),
        )
        .toPromise();
  }
}

export class PersonaTesterFactory {
  constructor(
      private readonly vineBuilder_: VineBuilder,
      private readonly personaBuilder_: PersonaBuilder,
  ) { }

  build(tags: string[]): PersonaTester {
    const origCreateElement = document.createElement;
    const createElement = (tag: string) => origCreateElement.call(document, tag);
    const customElementRegistry = new FakeCustomElementRegistry(createElement);
    const vine = this.vineBuilder_.run();

    const tagsSet = new Set(tags);

    this.personaBuilder_.build(tags, customElementRegistry, vine);

    const tester = new PersonaTester(vine, customElementRegistry);
    fake(spy(document, 'createElement'))
        .always().call(tag => {
          if (tagsSet.has(tag)) {
            return tester.createElement(tag, null);
          } else {
            return createElement(tag);
          }
        });

    return tester;
  }
}

function getCtrl_(element: ElementWithCtrl): CustomElementCtrl {
  const ctrl = element[__ctrl];
  if (!ctrl) {
    throw new Error(`ctrl for element ${element} not found`);
  }

  return ctrl;
}

function getElement_<E extends Element>(
    element: ElementWithCtrl,
    locator: ResolvedWatchableLocator<E>,
): Exclude<E, null> {
  const shadowRoot = getShadowRoot_(element);
  const targetEl = locator.getValue(shadowRoot);
  if (!targetEl) {
    throw new Error(`Target element for ${locator} not found`);
  }

  return targetEl as Exclude<E, null>;
}

function getShadowRoot_(element: ElementWithCtrl): ShadowRoot {
  const shadowRoot = element.shadowRoot;
  if (!shadowRoot) {
    throw new Error(`ShadowRoot for element ${element} not found`);
  }

  return shadowRoot;
}
