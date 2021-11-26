import {source} from 'grapevine';
import {BehaviorSubject, Subject} from 'rxjs';

import {AttributeChangedEvent} from '../../export';
import {Spec} from '../types/ctrl';
import {ApiType, IValue, OValue} from '../types/io';
import {Registration, RegistrationSpec} from '../types/registration';
import {setAttributeChangeObservable} from '../util/attribute-change-observable';

import {upgradeElement} from './upgrade-element';


interface Typeof<T> {
  new (): T;
  prototype: T;
}


type ApiReadable<A> = {
  [K in keyof A]: A[K] extends OValue<infer T> ? T : A[K] extends IValue<infer T> ? T : never;
}

type ApiReadonlyKeys<A> = {
  readonly [K in keyof A]: A[K] extends IValue<unknown> ? never :
      A[K] extends OValue<unknown> ? K : never;
}[keyof A];

type ApiReadonly<A> = Readonly<ApiReadable<Pick<A, ApiReadonlyKeys<A>>>>;

export type ApiAsProperties<S extends Spec> = ApiReadable<S['host']>&ApiReadonly<S['host']>;

export function registerCustomElement<S extends Spec>(
    spec: RegistrationSpec<S>,
): Registration<ApiAsProperties<S>&HTMLElement, S> {
  const base = source(vine => {
    const elementClass = class extends HTMLElement {
      private readonly onAttributeChanged$ = new Subject<AttributeChangedEvent>();
      private readonly isConnected$ = new BehaviorSubject<boolean>(false);

      constructor() {
        super();
        setAttributeChangeObservable(this, this.onAttributeChanged$);
        upgradeElement(registration, this, this.isConnected$, vine);
      }

      static get observedAttributes(): readonly string[] {
        const attributes = [];
        const hostSpecs = spec.spec.host ?? {};
        for (const key in hostSpecs) {
          const spec = hostSpecs[key];
          if (spec.apiType !== ApiType.ATTR) {
            continue;
          }

          attributes.push(spec.attrName);
        }

        return attributes;
      }

      attributeChangedCallback(attrName: string): void {
        this.onAttributeChanged$.next({attrName});
      }

      connectedCallback(): void {
        this.isConnected$.next(true);
      }

      disconnectedCallback(): void {
        this.isConnected$.next(false);
      }
    };

    return elementClass as unknown as Typeof<ApiAsProperties<S>&HTMLElement>;
  });

  const registration = Object.assign(base,
      {
        ...spec,
        configure: spec.configure ?? (() => undefined),
      });

  return registration;
}