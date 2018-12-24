import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType, Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { elementObservable } from '../util/element-observable';
import { UnresolvedElementPropertyOutput, Output } from '../component/output';

interface Properties<E extends Element> {
  readonly [key: string]: UnresolvedElementPropertyOutput<E, any>;
}

type Resolved<P extends Properties<Element>> = {
  [K in keyof P]: P[K] extends UnresolvedElementPropertyOutput<Element, infer T> ?
      Output<T> : never;
}

export class ElementInput<E extends Element, P extends Properties<E>> {
  readonly _: Resolved<P>;
  readonly id: InstanceStreamId<E>;

  constructor(
      private readonly selector: string|null,
      properties: P,
      type: Type<E>,
  ) {
    this.id = instanceStreamId(`element(${selector})`, type);
    this._ = this.resolve(properties);
  }

  getValue(root: ShadowRoot): Observable<E> {
    return elementObservable<E>(root, root => {
      const el = this.selector ? root.getElementById(this.selector) : root.host;
      const type = this.id.getType();
      if (!type.check(el)) {
        throw Errors.assert(`Element of [${this.selector}]`).shouldBeA(type).butWas(el);
      }

      return el;
    }).pipe(distinctUntilChanged());
  }

  private resolve(properties: P): Resolved<P> {
    const resolvedProperties: Resolved<any> = {};
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
    selector: string,
    type: Type<E>,
    properties: P,
): ElementInput<E, P>;
export function element<P extends Properties<Element>>(
    selectorOrProperties: string|P,
    type?: Type<Element>,
    properties?: P,
): ElementInput<Element, P> {
  if (typeof selectorOrProperties === 'string') {
    if (properties && type) {
      return new ElementInput(selectorOrProperties, properties, type);
    } else {
      throw new Error('invalid input');
    }
  } else {
    return new ElementInput(null, selectorOrProperties, InstanceofType(Element));
  }
}
