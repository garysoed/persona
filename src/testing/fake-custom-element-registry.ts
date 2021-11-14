import {FakeTime, run} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {AnyTodo} from 'gs-tools/export/typescript';
import {tap} from 'rxjs/operators';

import {BaseCtrlCtor} from '../core/base-ctrl';
import {Builder} from '../core/builder';
import {CustomElementClass, __customElementImplFactory} from '../core/custom-element-class';
import {CHECK_PERIOD_MS} from '../input/property-observer';
import {mutationObservable} from '../util/mutation-observable';


type Listener = () => void;
const __upgraded = Symbol('upgraded');

type UpgradedElement = HTMLElement & {[__upgraded]?: boolean};

export class FakeCustomElementRegistry implements CustomElementRegistry {
  private readonly definedElements: Map<string, CustomElementClass> = new Map();
  private readonly listeners: Map<string, Listener[]> = new Map();

  constructor(
      private readonly createElement: (tag: string) => HTMLElement,
      private readonly fakeTime: FakeTime,
      private readonly builder: Builder,
  ) { }

  create(tagOrCtrl: string|BaseCtrlCtor<{}>): HTMLElement {
    const el = typeof tagOrCtrl === 'string'
      ? this.createElementByTag(tagOrCtrl) : this.createElementByCtrl(tagOrCtrl);
    this.upgradeElement(el);
    this.fakeTime.tick(CHECK_PERIOD_MS);
    return el;
  }

  private createElementByCtrl(ctrl: BaseCtrlCtor<{}>): HTMLElement {
    const tag = this.builder.getSpec(ctrl)?.tag;
    if (!tag) {
      throw new Error(`Element ${ctrl.name} not registered`);
    }

    return this.createElementByTag(tag);
  }

  private createElementByTag(tag: string): HTMLElement {
    return this.createElement(tag);
  }

  define(tag: string, constructor: CustomElementClass): void {
    this.definedElements.set(tag, constructor);

    const listeners = this.listeners.get(tag) || [];
    for (const listener of listeners) {
      listener();
    }
  }

  get(tag: string): AnyTodo|CustomElementClass|null {
    return this.definedElements.get(tag) || null;
  }

  upgrade(): void {
    throw new Error('Method not implemented.');
  }

  async whenDefined(tag: string): Promise<AnyTodo|void> {
    return new Promise(resolve => {
      // Already defined.
      if (this.get(tag)) {
        resolve({} as AnyTodo);

        return;
      }

      const listeners = this.listeners.get(tag) || [];
      listeners.push(resolve as AnyTodo);
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
    const ctor = this.get(tag);
    if (!ctor) {
      return;
    }
    const customElement = ctor[__customElementImplFactory](el, 'open');
    run(customElement.run());

    run(mutationObservable(el, {attributes: true}).pipe(
        tap(records => {
          for (const {attributeName} of records) {
            if (!attributeName) {
              continue;
            }

            customElement.attributeChangedCallback(attributeName);
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
  }
}
