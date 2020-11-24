import {PersonaContext} from '../core/persona-context';
import {UnresolvedAttributeInput} from '../input/attribute';
import {UnresolvedHasAttributeInput} from '../input/has-attribute';
import {HostAttribute} from '../main/host-attribute';
import {HostHasAttribute} from '../main/host-has-attribute';
import {Input} from '../types/input';
import {Output} from '../types/output';
import {Selector} from '../types/selector';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';

import {PropertySpecs, Resolved} from './property-spec';

export class RootSelector<P extends PropertySpecs<ShadowRoot>> implements Selector<ShadowRoot, P> {
  readonly _ = this.resolveProperties();

  constructor(
      private readonly properties: P,
  ) { }

  getSelectable(context: PersonaContext): ShadowRoot {
    return context.shadowRoot;
  }

  private resolveProperties(): Resolved<ShadowRoot, P> {
    const resolvedProperties: Resolved<ShadowRoot, any> = {};
    for (const key in this.properties) {
      if (!this.properties.hasOwnProperty(key)) {
        continue;
      }

      resolvedProperties[key] = this.resolveProperty(this.properties[key]);
    }

    return resolvedProperties;
  }

  private resolveProperty(
      property: UnresolvedElementProperty<ShadowRoot, any>,
  ): Input<unknown>|Output<unknown> {
    if (property instanceof UnresolvedAttributeInput) {
      return new HostAttribute(property.attrName, property.parser, property.defaultValue);
    }

    if (property instanceof UnresolvedHasAttributeInput) {
      return new HostHasAttribute(property.attrName);
    }

    return property.resolve(context => this.getSelectable(context));
  }
}

export function root<P extends PropertySpecs<ShadowRoot>>(apiSpecs: P): RootSelector<P> {
  return new RootSelector(apiSpecs);
}
