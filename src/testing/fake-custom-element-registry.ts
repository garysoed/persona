import {Vine} from 'grapevine';
import {run} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {BehaviorSubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {getObservedAttributes} from '../core/get-observed-attributes';
import {upgradeElement} from '../core/upgrade-element';
import {Spec} from '../types/ctrl';
import {AttributeChangedEvent} from '../types/event';
import {CustomElementRegistration} from '../types/registration';
import {setAttributeChangeObservable} from '../util/attribute-change-observable';
import {mutationObservable} from '../util/mutation-observable';

type Listener = (value: CustomElementConstructor) => void;
export const __upgraded = Symbol('upgraded');

type UpgradedElement = HTMLElement & {
  attributeChangedCallback?: (attrName: string) => void;
  [__upgraded]?: boolean;
};

export class FakeCustomElementRegistry implements CustomElementRegistry {
  private readonly definedElements: Map<string, CustomElementConstructor> =
    new Map();
  private readonly listeners: Map<string, Listener[]> = new Map();

  constructor(
    // Do not use document.createElement since it will be faked.
    private readonly createElement: (
      namespace: string | null,
      tag: string,
    ) => Element,
    private readonly registrationMap: ReadonlyMap<
      string,
      CustomElementRegistration<HTMLElement, Spec>
    >,
    private readonly vine: Vine,
  ) {}

  create(namespace: string | null, tag: string): Element {
    const el = this.createElement(namespace, tag);
    if (el instanceof HTMLElement) {
      this.upgradeElement(el);
    }
    return el;
  }
  define(tag: string, constructor: CustomElementConstructor): void {
    this.definedElements.set(tag, constructor);

    const listeners = this.listeners.get(tag) || [];
    for (const listener of listeners) {
      listener(constructor);
    }
  }
  get(tag: string): CustomElementConstructor {
    const el = this.definedElements.get(tag);
    if (!el) {
      throw new Error(`Element with tag ${tag} is not registered`);
    }

    return el;
  }
  getName(): string | null {
    throw new Error('Method not implemented.');
  }
  upgrade(node: Node): void {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    this.upgradeElement(node);
  }
  upgradeElement(el: UpgradedElement): void {
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

    const isConnected$ = new BehaviorSubject(false);
    const onAttributeChanged$ = new Subject<AttributeChangedEvent>();
    setAttributeChangeObservable(el, onAttributeChanged$);
    const observedAttributes = new Set(getObservedAttributes(registration));
    const decoratedEl = Object.assign(el, {
      attributeChangedCallback(attrName: string): void {
        if (!observedAttributes.has(attrName)) {
          return;
        }
        onAttributeChanged$.next({attrName});
      },

      connectedCallback(): void {
        isConnected$.next(true);
      },

      disconnectedCallback(): void {
        isConnected$.next(false);
      },
    });

    upgradeElement(registration, decoratedEl, isConnected$, this.vine);

    run(
      mutationObservable(el, {attributes: true}).pipe(
        tap((records) => {
          for (const {attributeName} of records) {
            if (!attributeName || !el.attributeChangedCallback) {
              continue;
            }

            el.attributeChangedCallback(attributeName);
          }
        }),
      ),
    );

    // Recursively upgrade the element.
    const nodeList = el.shadowRoot?.querySelectorAll('*');
    const nodeArray = nodeList ? arrayFrom(nodeList) : [];
    for (const node of nodeArray) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      this.upgradeElement(node);
    }

    decoratedEl.connectedCallback();
  }
  async whenDefined(tag: string): Promise<CustomElementConstructor> {
    return new Promise((resolve) => {
      // Already defined.
      try {
        const el = this.get(tag);
        resolve(el);
        return;
      } catch {
        const listeners = this.listeners.get(tag) || [];
        listeners.push(resolve);
        this.listeners.set(tag, listeners);
      }
    });
  }
}
