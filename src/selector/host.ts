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

export class HostSelector<P extends PropertySpecs<Element>> implements Selector<Element, P> {
  readonly _ = this.resolveUnresolvedObject(this.properties);

  constructor(
      private readonly properties: P,
  ) { }

  getSelectable(context: ShadowContext): Element {
    return context.shadowRoot.host;
  }

  private resolveUnresolvedObject<P extends PropertySpecs<Element>>(unresolved: P): Resolved<Element, P> {
    return mapObject<P, Resolved<Element, P>>(
        unresolved,
        <K extends Extract<keyof P, string>>(_: K, prop: P[K]) => {
          if (UNRESOLVED_ELEMENT_PROPERTY_TYPE.check(prop)) {
            return this.resolveProperty(prop) as Resolved<Element, P>[K];
          }

          return this.resolveUnresolvedObject(prop as PropertySpecs<Element>) as Resolved<Element, P>[K];
        },
    );
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

    return property.resolve(context => this.getSelectable(context));
  }
}

export function host<P extends PropertySpecs<Element>>(apiSpecs: P): HostSelector<P> {
  return new HostSelector(apiSpecs);
}
