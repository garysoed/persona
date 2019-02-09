import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { Errors } from 'gs-tools/export/error';
import { InstanceofType, Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { elementObservable } from '../util/element-observable';

interface Properties<E extends Element> {
  readonly [key: string]: UnresolvedElementProperty<E, any>;
}

type Resolved<E extends Element, P extends Properties<E>> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<E, infer R> ? R : never;
};

export class ElementInput<E extends Element, P extends Properties<E>> implements Input<E> {
  readonly _: Resolved<E, P>;
  readonly id: InstanceStreamId<E>;

  constructor(
      private readonly elementId: string|null,
      properties: P,
      type: Type<E>,
  ) {
    this.id = instanceStreamId(`element#${elementId}`, type);
    this._ = this.resolve(properties);
  }

  getValue(root: ShadowRoot): Observable<E> {
    return elementObservable<E>(root, root => {
      const el = this.elementId ? root.getElementById(this.elementId) : root.host;
      const type = this.id.getType();
      if (!type.check(el)) {
        throw Errors.assert(`Element of [${this.elementId}]`).shouldBeA(type).butWas(el);
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

export function element<P extends Properties<Element>>(
    properties: P,
): ElementInput<Element, P>;
export function element<E extends Element, P extends Properties<E>>(
    id: string,
    type: Type<E>,
    properties: P,
): ElementInput<E, P>;
export function element<P extends Properties<Element>>(
    idOrProperties: string|P,
    type?: Type<Element>,
    properties?: P,
): ElementInput<Element, P> {
  if (typeof idOrProperties === 'string') {
    if (properties && type) {
      return new ElementInput(idOrProperties, properties, type);
    } else {
      throw new Error('invalid input');
    }
  } else {
    return new ElementInput(null, idOrProperties, InstanceofType(Element));
  }
}
