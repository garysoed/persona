import {mapObject} from 'gs-tools/export/typescript';
import {Type, elementWithTagType} from 'gs-types';

import {ShadowContext} from '../core/shadow-context';
import {ResolvedSpec, UnresolvedSpec, api} from '../main/api';
import {ComponentSpec} from '../main/component-spec';
import {Selector} from '../types/selector';
import {UNRESOLVED_ELEMENT_PROPERTY_TYPE} from '../types/unresolved-element-property';

import {PropertySpecs, Resolved} from './property-spec';


export class ElementSelector<E extends Element, P extends PropertySpecs<E>> implements Selector<E, P> {
  readonly _ = this.resolveUnresolvedObject(this.properties);

  constructor(
      private readonly elementId: string,
      private readonly properties: P,
      private readonly type: Type<E>,
  ) {
  }

  getSelectable({shadowRoot}: ShadowContext): E {
    const el = shadowRoot.getElementById(this.elementId);
    if (!this.type.check(el)) {
      throw new Error(`Element of [${this.elementId}] should be a ${this.type} but was ${el}`);
    }
    return el;
  }

  private resolveUnresolvedObject<P extends PropertySpecs<E>>(unresolved: P): Resolved<E, P> {
    return mapObject<P, Resolved<E, P>>(
        unresolved,
        <K extends Extract<keyof P, string>>(_: K, prop: P[K]) => {
          if (UNRESOLVED_ELEMENT_PROPERTY_TYPE.check(prop)) {
            return prop.resolve(context => this.getSelectable(context)) as Resolved<E, P>[K];
          }

          return this.resolveUnresolvedObject(prop as PropertySpecs<E>) as Resolved<E, P>[K];
        },
    );
  }
}

export function element<E extends Element, P extends PropertySpecs<E>>(
    id: string,
    type: Type<E>,
    properties: P,
): ElementSelector<E, P>;
export function element<P extends UnresolvedSpec, E extends Element, PX extends PropertySpecs<E>>(
    id: string,
    spec: ComponentSpec<P, E>,
    properties: PX,
): ElementSelector<E, ResolvedSpec<P>&PX>;
export function element(
    id: string,
    typeOrSpec: Type<Element>|ComponentSpec<UnresolvedSpec, Element>,
    properties: PropertySpecs<Element>,
): ElementSelector<Element, PropertySpecs<Element>> {
  if (typeOrSpec instanceof Type) {
    return new ElementSelector(id, properties, typeOrSpec);
  } else {
    return new ElementSelector(
        id,
        {
          ...api(typeOrSpec.api),
          ...properties,
        },
        elementWithTagType(typeOrSpec.tag),
    );
  }
}
