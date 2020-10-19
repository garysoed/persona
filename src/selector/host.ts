import { PersonaContext } from '../core/persona-context';
import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHasAttributeInput } from '../input/has-attribute';
import { HostAttribute } from '../main/host-attribute';
import { HostHasAttribute } from '../main/host-has-attribute';
import { Input } from '../types/input';
import { Output } from '../types/output';
import { Selector } from '../types/selector';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


interface PropertySpecs {
  readonly [key: string]: UnresolvedElementProperty<Element, any>;
}

type Resolved<P extends PropertySpecs> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<Element, infer R> ? R : never;
};

export class HostSelector<P extends PropertySpecs> implements Selector<Element> {
  readonly _ = this.resolveProperties();

  constructor(
      private readonly properties: P,
  ) { }

  getElement(context: PersonaContext): Element {
    return context.shadowRoot.host;
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

export function host<P extends PropertySpecs>(apiSpecs: P): HostSelector<P> {
  return new HostSelector(apiSpecs);
}