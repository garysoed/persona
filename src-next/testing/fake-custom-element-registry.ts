import {Vine} from 'grapevine';
import {run} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {tap} from 'rxjs/operators';

import {upgradeElement} from '../core/upgrade-element';
import {Spec} from '../types/ctrl';
import {Registration} from '../types/registration';
import {mutationObservable} from '../util/mutation-observable';


type Listener = () => void;
const __upgraded = Symbol('upgraded');

type UpgradedElement = HTMLElement & {
  attributeChangedCallback?: (attrName: string) => void;
  [__upgraded]?: boolean
};

export class FakeCustomElementRegistry implements CustomElementRegistry {
  private readonly definedElements: Map<string, CustomElementConstructor> = new Map();
  private readonly listeners: Map<string, Listener[]> = new Map();

  constructor(
      // Do not use document.createElement since it will be faked.
      private readonly createElement: (tag: string) => HTMLElement,
      private readonly registrationMap: ReadonlyMap<string, Registration<HTMLElement, Spec>>,
      private readonly vine: Vine,
  ) { }

  create(tag: string): HTMLElement {
    const el = this.createElement(tag);
    this.upgradeElement(el);
    // this.fakeTime.tick(CHECK_PERIOD_MS);
    return el;
  }

  define(tag: string, constructor: CustomElementConstructor): void {
    this.definedElements.set(tag, constructor);

    const listeners = this.listeners.get(tag) || [];
    for (const listener of listeners) {
      listener();
    }
  }

  get(tag: string): CustomElementConstructor|null {
    return this.definedElements.get(tag) || null;
  }

  upgrade(): void {
    throw new Error('Method not implemented.');
  }

  async whenDefined(tag: string): Promise<void> {
    return new Promise(resolve => {
      // Already defined.
      if (this.get(tag)) {
        resolve();

        return;
      }

      const listeners = this.listeners.get(tag) || [];
      listeners.push(resolve);
      this.listeners.set(tag, listeners);
    });
  }

  private upgradeElement(el: UpgradedElement): void {
    if (el[__upgraded]) {
      // Already upgraded, so ignore it.
      return;
    }
    el[__upgraded] = true;

    const tag = el.tagName.toLowerCase();
    const registration = this.registrationMap.get(tag);
    if (!registration) {
      return;
    }

    const upgradedEl = upgradeElement(registration, el, this.vine);

    run(mutationObservable(el, {attributes: true}).pipe(
        tap(records => {
          for (const {attributeName} of records) {
            if (!attributeName || !el.attributeChangedCallback) {
              continue;
            }

            el.attributeChangedCallback(attributeName);
          }
        }),
    ));

    // Recursively upgrade the element.
    const nodeList = el.shadowRoot?.querySelectorAll('*');
    const nodeArray = nodeList ? arrayFrom(nodeList) : [];
    for (const node of nodeArray) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      this.upgradeElement(node);
    }

    upgradedEl.connectedCallback();
  }
}
