import { Observable, of as observableOf } from 'rxjs';

import { PersonaContext } from '../core/persona-context';
import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHasAttributeInput } from '../input/has-attribute';
import { Input } from '../types/input';
import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

import { HostAttribute } from './host-attribute';
import { HostHasAttribute } from './host-has-attribute';


interface PropertySpecs {
  readonly [key: string]: UnresolvedElementProperty<Element, any>;
}

type Resolved<P extends PropertySpecs> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<Element, infer R> ? R : never;
};

export class HostInput<P extends PropertySpecs> implements Input<Element> {
  readonly _ = this.resolveProperties();

  constructor(
      private readonly properties: P,
  ) { }

  getElement(context: PersonaContext): Element {
    return context.shadowRoot.host;
  }

  getValue(context: PersonaContext): Observable<Element> {
    return observableOf(this.getElement(context));
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

  private resolveProperty(
      property: UnresolvedElementProperty<Element, any>,
  ): Input<unknown>|Output<unknown> {
    if (property instanceof UnresolvedAttributeInput) {
      return new HostAttribute(property.attrName, property.parser, property.defaultValue);
    }

    if (property instanceof UnresolvedHasAttributeInput) {
      return new HostHasAttribute(property.attrName);
    }

    return property.resolve(context => this.getElement(context));
  }
}

export function host<P extends PropertySpecs>(apiSpecs: P): HostInput<P> {
  return new HostInput(apiSpecs);
}
