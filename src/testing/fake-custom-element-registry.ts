import { __customElementImplFactory, CustomElementClass } from '../main/custom-element-class';

type Listener = () => void;

export class FakeCustomElementRegistry implements CustomElementRegistry {
  private readonly definedElements_: Map<string, CustomElementClass> = new Map();
  private readonly listeners_: Map<string, Listener[]> = new Map();

  constructor(private readonly createElement_: (tag: string) => HTMLElement) { }

  // TODO: parent shouldn't be here.
  create(tag: string, parent: HTMLElement|null): HTMLElement {
    const el = this.createElement_(tag);
    if (parent) {
      parent.appendChild(el);
    }

    this.upgradeElement_(el);

    return el;
  }

  define(tag: string, constructor: CustomElementClass): void {
    this.definedElements_.set(tag, constructor);

    const listeners = this.listeners_.get(tag) || [];
    for (const listener of listeners) {
      listener();
    }
  }

  get(tag: string): CustomElementClass|null {
    return this.definedElements_.get(tag) || null;
  }

  upgrade(root: Node): void {
    throw new Error('Method not implemented.');
  }

  private upgradeElement_(el: HTMLElement): void {
    const tag = el.tagName.toLowerCase();
    const ctor = this.get(tag);
    if (!ctor) {
      return;
    }
    const customElement = ctor[__customElementImplFactory](el, 'open');
    customElement.connectedCallback();

    const nodeList = el.shadowRoot!.querySelectorAll('*');
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList.item(i);
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      this.upgradeElement_(node);
    }
  }

  whenDefined(tag: string): Promise<void> {
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
}
