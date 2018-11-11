import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableList } from 'gs-tools/src/immutable';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { ResolvedAttributeLocator } from '../locator/attribute-locator';
import { ResolvedElementLocator } from '../locator/element-locator';
import { ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
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

  createElement(tag: string, parent: HTMLElement): HTMLElement {
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
      locator: ResolvedAttributeLocator<T>,
  ): T {
    const targetEl = getElement_(element, locator.elementLocator);
    const value = locator.parser.convertBackward(
        targetEl.getAttribute(locator.attrName));
    if (!locator.getType().check(value)) {
      throw new Error(`Value ${value} is the wrong type for ${locator}`);
    }

    return value;
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
      locator: ResolvedAttributeLocator<T>,
      value: T,
  ): Promise<unknown> {
    const targetEl = getElement_(element, locator.elementLocator);
    const strValue = locator.parser.convertForward(value) || '';
    targetEl.setAttribute(locator.attrName, strValue);

    return this.vine.getObservable(locator.getReadingId(), getCtrl_(element))
        .pipe(
            map(currentValue => locator.parser.convertForward(currentValue)),
            filter(currentValueStr => currentValueStr === strValue),
            take(1),
        )
        .toPromise();
  }

  simulateKeypress(
      element: ElementWithCtrl,
      locator: ResolvedWatchableLocator<HTMLElement>,
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
      locator: ResolvedWatchableLocator<T>|ResolvedRenderableWatchableLocator<T>,
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

  build(ctors: (typeof CustomElementCtrl)[]): PersonaTester {
    const customElementRegistry = new FakeCustomElementRegistry();
    const vine = this.vineBuilder_.run();
    this.personaBuilder_.build(ctors, customElementRegistry, vine);

    return new PersonaTester(vine, customElementRegistry);
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
    locator: ResolvedWatchableLocator<E>): Exclude<E, null> {
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
