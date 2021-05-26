import {mapObject} from 'gs-tools/export/typescript';

import {ShadowContext} from '../core/shadow-context';
import {UnresolvedAttributeInput} from '../input/attribute';
import {UnresolvedHasAttributeInput} from '../input/has-attribute';
import {HostAttribute} from '../main/host-attribute';
import {HostHasAttribute} from '../main/host-has-attribute';
import {Input} from '../types/input';
import {Output} from '../types/output';
import {Selector} from '../types/selector';
import {UnresolvedElementProperty, UNRESOLVED_ELEMENT_PROPERTY_TYPE} from '../types/unresolved-element-property';

import {PropertySpecs, Resolved} from './property-spec';

export class RootSelector<P extends PropertySpecs<ShadowRoot>> implements Selector<ShadowRoot, P> {
  readonly _ = this.resolveUnresolvedObject(this.properties);

  constructor(
      private readonly properties: P,
  ) { }

  getSelectable(context: ShadowContext): ShadowRoot {
    return context.shadowRoot;
  }

  private resolveUnresolvedObject<P extends PropertySpecs<ShadowRoot>>(unresolved: P): Resolved<ShadowRoot, P> {
    return mapObject<P, Resolved<ShadowRoot, P>>(
        unresolved,
        <K extends Extract<keyof P, string>>(_: K, prop: P[K]) => {
          if (UNRESOLVED_ELEMENT_PROPERTY_TYPE.check(prop)) {
            return this.resolveProperty(prop) as Resolved<ShadowRoot, P>[K];
          }

          return this.resolveUnresolvedObject(prop as PropertySpecs<ShadowRoot>) as Resolved<ShadowRoot, P>[K];
        },
    );
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
