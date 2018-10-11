import { Errors } from 'gs-tools/src/error';
import { __customElementImplFactory, CustomElementClass } from '../main/custom-element-class';

type Listener = () => void;

export class FakeCustomElementRegistry implements CustomElementRegistry {
  private readonly definedElements_: Map<string, CustomElementClass> = new Map();
  private readonly listeners_: Map<string, Listener[]> = new Map();

  create(tag: string, parent: HTMLElement): HTMLElement {
    const ctor = this.get(tag);
    if (!ctor) {
      throw Errors.assert(`Registry for [${tag}]`).shouldExist().butNot();
    }

    const el = document.createElement(tag);
    parent.appendChild(el);
    const customElement = ctor[__customElementImplFactory](el, 'open');
    customElement.connectedCallback();

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

  whenDefined(tag: string): PromiseLike<void> {
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