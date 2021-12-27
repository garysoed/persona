import {source} from 'grapevine';
import {BehaviorSubject, Subject} from 'rxjs';

import {Spec} from '../types/ctrl';
import {AttributeChangedEvent} from '../types/event';
import {ICall, IValue, OValue} from '../types/io';
import {Registration, RegistrationSpec} from '../types/registration';
import {setAttributeChangeObservable} from '../util/attribute-change-observable';

import {getObservedAttributes} from './get-observed-attributes';
import {upgradeElement} from './upgrade-element';


interface Typeof<T> {
  new (): T;
  prototype: T;
}

export type PropertyNameOf<O> = O extends OValue<any, infer P> ? P :
    O extends IValue<any, infer P> ? P :
    never;

type ApiReadableKeys<A> = {
  readonly [K in keyof A]: A[K] extends OValue<any, any> ? K :
      A[K] extends IValue<any, any> ? K : never;
}[keyof A];

type ApiReadableRaw<A> = {
  [K in keyof A as PropertyNameOf<A[K]>]: A[K] extends OValue<infer T, string> ? T :
      A[K] extends IValue<infer T, string> ? T : never;
};

type ApiReadable<A> = ApiReadableRaw<Pick<A, ApiReadableKeys<A>>>;


type ApiReadonlyKeys<A> = {
  readonly [K in keyof A]: A[K] extends OValue<unknown, any> ? K : never;
}[keyof A];

type ApiReadonlyRaw<A> = {
  readonly [K in keyof A as PropertyNameOf<A[K]>]: A[K] extends OValue<infer T, string> ? T :
      never;
};


export type ApiReadonly<A> = ApiReadonlyRaw<Pick<A, ApiReadonlyKeys<A>>>;


type MethodNameOf<O> = O extends ICall<any, infer M> ? M : never;

type ApiMethodRaw<A> = {
  [K in keyof A as MethodNameOf<A[K]>]: A[K] extends ICall<infer A, string> ? (arg: A) => void : never;
}

type ApiMethodKeys<A> = {
  readonly [K in keyof A]: A[K] extends ICall<any, any> ? K : never;
}[keyof A];

type ApiMethod<A> = ApiMethodRaw<Pick<A, ApiMethodKeys<A>>>;


export type ApiAsProperties<S extends Spec> = (ApiReadable<S['host']>&ApiReadonly<S['host']>&ApiMethod<S['host']>);

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
        return getObservedAttributes(spec);
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