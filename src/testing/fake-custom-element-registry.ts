import { CHECK_PERIOD_MS } from '../input/property-observer';
import { CustomElementClass, __customElementImplFactory } from '../core/custom-element-class';
import { FakeTime, run } from 'gs-testing';
import { arrayFrom } from 'gs-tools/export/collect';
import { mutationObservable } from '../util/mutation-observable';
import { tap } from 'rxjs/operators';


type Listener = () => void;
const __upgraded = Symbol('upgraded');

type UpgradedElement = HTMLElement & {[__upgraded]?: boolean};

export class FakeCustomElementRegistry implements CustomElementRegistry {
  private readonly definedElements: Map<string, CustomElementClass> = new Map();
  private readonly listeners_: Map<string, Listener[]> = new Map();

  constructor(
      private readonly createElement_: (tag: string) => HTMLElement,
      private readonly fakeTime: FakeTime,
  ) { }

  create(tag: string): HTMLElement {
    const el = this.createElement_(tag);
    this.upgradeElement_(el);
    this.fakeTime.tick(CHECK_PERIOD_MS);

    return el;
  }

  define(tag: string, constructor: CustomElementClass): void {
    this.definedElements.set(tag, constructor);

    const listeners = this.listeners_.get(tag) || [];
    for (const listener of listeners) {
      listener();
    }
  }

  get(tag: string): CustomElementClass|null {
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

      const listeners = this.listeners_.get(tag) || [];
      listeners.push(resolve);
      this.listeners_.set(tag, listeners);
    });
  }

  private upgradeElement_(el: UpgradedElement): void {
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
      this.upgradeElement_(node);
    }
  }
}
