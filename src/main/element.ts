import { elementWithTagType, Type } from 'gs-types';
import { Observable, of as observableOf } from 'rxjs';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { api, ConvertedSpec, UnconvertedSpec } from './api';
import { ComponentSpec } from './component-spec';


interface Properties<E extends Element> {
  readonly [key: string]: UnresolvedElementProperty<E, any>;
}

type Resolved<E extends Element, P extends Properties<E>> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<E, infer R> ? R : never;
};

export class ElementInput<E extends Element, P extends Properties<E>> implements Input<E> {
  readonly _: Resolved<E, P>;

  constructor(
      private readonly elementId: string,
      properties: P,
      private readonly type: Type<E>,
  ) {
    this._ = this.resolve(properties);
  }

  getValue({shadowRoot}: PersonaContext): Observable<E> {
    const el = shadowRoot.getElementById(this.elementId);
    if (!this.type.check(el)) {
      throw new Error(`Element of [${this.elementId}] should be a ${this.type} but was ${el}`);
    }
    return observableOf(el);
  }

  private resolve(properties: P): Resolved<E, P> {
    const resolvedProperties: Resolved<any, any> = {};
    for (const key in properties) {
      if (!properties.hasOwnProperty(key)) {
        continue;
      }

      resolvedProperties[key] = properties[key].resolve(root => this.getValue(root));
    }

    return resolvedProperties;
  }
}

export function element<E extends Element, P extends Properties<E>>(
    id: string,
    type: Type<E>,
    properties: P,
): ElementInput<E, P>;
export function element<P extends UnconvertedSpec, PX extends Properties<Element>>(
    id: string,
    spec: ComponentSpec<P>,
    properties: PX,
): ElementInput<HTMLElement, ConvertedSpec<P>&PX>;
export function element(
    id: string,
    typeOrSpec: Type<Element>|ComponentSpec<UnconvertedSpec>,
    properties: Properties<Element>,
): ElementInput<Element, Properties<Element>> {
  if (typeOrSpec instanceof Type) {
    return new ElementInput(id, properties, typeOrSpec);
  } else {
    return new ElementInput(
        id,
        {
          ...api(typeOrSpec.api),
          ...properties,
        },
        elementWithTagType(typeOrSpec.tag),
    );
  }
}
