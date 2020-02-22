import { Errors } from 'gs-tools/export/error';
import { elementWithTagType, instanceofType, Type } from 'gs-types';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Input } from '../types/input';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { elementObservable } from '../util/element-observable';

import { api, ConvertedSpec, UnconvertedSpec } from './api';


interface Properties<E extends Element> {
  readonly [key: string]: UnresolvedElementProperty<E, any>;
}

type Resolved<E extends Element, P extends Properties<E>> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<E, infer R> ? R : never;
};

export class ElementInput<E extends Element, P extends Properties<E>> implements Input<E> {
  readonly _: Resolved<E, P>;

  constructor(
      private readonly elementId: string|null,
      properties: P,
      private readonly type: Type<E>,
  ) {
    this._ = this.resolve(properties);
  }

  getValue(root: ShadowRootLike): Observable<E> {
    return elementObservable(root, root => {
      const el = this.elementId ? root.getElementById(this.elementId) : root.host;
      if (!this.type.check(el)) {
        throw Errors.assert(`Element of [${this.elementId}]`).shouldBeA(this.type).butWas(el);
      }

      return el;
    }).pipe(distinctUntilChanged());
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

export interface ComponentSpec<P extends UnconvertedSpec> {
  readonly api: P;
  readonly tag: string;
}

export function element<P extends Properties<Element>>(
    properties: P,
): ElementInput<Element, P>;
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
    idOrProperties: string|Properties<Element>,
    typeOrSpec?: Type<Element>|ComponentSpec<UnconvertedSpec>,
    properties?: Properties<Element>,
): ElementInput<Element, Properties<Element>> {
  if (typeof idOrProperties === 'string') {
    if (properties && typeOrSpec) {
      if (typeOrSpec instanceof Type) {
        return new ElementInput(idOrProperties, properties, typeOrSpec);
      } else {
        return new ElementInput(
            idOrProperties,
            {
              ...api(typeOrSpec.api),
              ...properties,
            },
            elementWithTagType(typeOrSpec.tag),
        );
      }
    } else {
      throw new Error('invalid input');
    }
  } else {
    return new ElementInput(null, idOrProperties, instanceofType(Element));
  }
}
