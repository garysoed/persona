import {source} from 'grapevine';
import {Subject} from 'rxjs';

import {Spec} from '../types/ctrl';
import {AttributeChangedEvent} from '../types/event';
import {IValue, OValue} from '../types/io';
import {Registration, RegistrationSpec} from '../types/registration';

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

      constructor() {
        super();
        upgradeElement(registration, this, vine);
      }

      attributeChangedCallback(attrName: string): void {
        this.onAttributeChanged$.next({attrName});
      }

      static get observedAttributes(): readonly string[] {
        // TODO
        return [];
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