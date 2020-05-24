import { Observable, of as observableOf } from 'rxjs';

import { PersonaContext } from '../core/persona-context';
import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHandlerInput } from '../input/handler';
import { UnresolvedHasAttributeInput } from '../input/has-attribute';
import { UnresolvedOnDomInput } from '../input/on-dom';
import { UnresolvedOnKeydownInput } from '../input/on-keydown';
import { Input } from '../types/input';
import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { HostAttribute } from './host-attribute';
import { HostEmitter } from './host-emitter';
import { HostHasAttribute } from './host-has-attribute';
import { HostObserver } from './host-observer';


type CompatibleProperties =
    | UnresolvedElementProperty<Element, Output<any>>
    | UnresolvedOnDomInput<any>
    | UnresolvedOnKeydownInput
    | UnresolvedHasAttributeInput
    | UnresolvedAttributeInput<any>
    | UnresolvedHandlerInput
    | HostEmitter<any>
    | HostObserver<any>;

interface PropertySpecs {
  readonly [key: string]: CompatibleProperties;
}

type Resolved<P extends PropertySpecs> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<Element, infer R> ? R : never;
};

class HostInput<P extends PropertySpecs> implements Input<Element> {
  readonly _ = this.resolveProperties();

  constructor(
      private readonly properties: P,
  ) { }

  getValue(context: PersonaContext): Observable<Element> {
    return observableOf(context.shadowRoot.host);
  }

  private resolveProperties(): Resolved<P> {
    const resolvedProperties: Resolved<any> = {};
    for (const key in this.properties) {
      if (!this.properties.hasOwnProperty(key)) {
        continue;
      }

      resolvedProperties[key] = this.resolveProperty(this.properties[key]);
    }

    return resolvedProperties;
  }

  private resolveProperty(property: CompatibleProperties): Input<unknown>|Output<unknown> {
    if (property instanceof UnresolvedAttributeInput) {
      return new HostAttribute(property.attrName, property.parser, property.defaultValue);
    }

    if (property instanceof UnresolvedHasAttributeInput) {
      return new HostHasAttribute(property.attrName);
    }

    if (property instanceof HostEmitter) {
      return property;
    }

    if (property instanceof HostObserver) {
      return property;
    }

    return property.resolve(context => this.getValue(context));
  }
}

export function host<P extends PropertySpecs>(specs: P): HostInput<P> {
  return new HostInput(specs);
}
