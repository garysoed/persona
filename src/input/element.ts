import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { Errors } from 'gs-tools/src/error';
import { Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { elementObservable } from '../util/element-observable';
import { ElementProperty } from './element-property';
import { InstanceofType } from 'gs-types/export';

interface Properties<E extends Element> {
  readonly [key: string]: ElementProperty<E, any>;
}

export class ElementInput<E extends Element, P extends Properties<E>> {
  readonly _: P;
  readonly id: InstanceStreamId<E>;

  constructor(
      private readonly selector: string|null,
      properties: P,
      type: Type<E>,
  ) {
    this.id = instanceStreamId(`element(${selector})`, type);
    this._ = properties;
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
