import {source} from 'grapevine';

import {Spec} from '../types/ctrl';
import {ApiType, IValue, OValue} from '../types/io';
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

      constructor() {
        super();
        upgradeElement(registration, this, vine);
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