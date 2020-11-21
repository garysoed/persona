import {Type, elementWithTagType} from 'gs-types';

import {PersonaContext} from '../core/persona-context';
import {ConvertedSpec, UnconvertedSpec, api} from '../main/api';
import {ComponentSpec} from '../main/component-spec';
import {Selector} from '../types/selector';

import {PropertySpecs, Resolved} from './property-spec';


export class ElementSelector<E extends Element, P extends PropertySpecs<E>> implements Selector<E> {
  readonly _: Resolved<E, P>;

  constructor(
      private readonly elementId: string,
      properties: P,
      private readonly type: Type<E>,
  ) {
    this._ = this.resolve(properties);
  }

  getSelectable({shadowRoot}: PersonaContext): E {
    const el = shadowRoot.getElementById(this.elementId);
    if (!this.type.check(el)) {
      throw new Error(`Element of [${this.elementId}] should be a ${this.type} but was ${el}`);
    }
    return el;
  }

  private resolve(properties: P): Resolved<E, P> {
    const resolvedProperties: Resolved<any, any> = {};
    for (const key in properties) {
      if (!properties.hasOwnProperty(key)) {
        continue;
      }

      resolvedProperties[key] = properties[key].resolve(context => this.getSelectable(context));
    }

    return resolvedProperties;
  }
}

export function element<E extends Element, P extends PropertySpecs<E>>(
    id: string,
    type: Type<E>,
    properties: P,
): ElementSelector<E, P>;
export function element<P extends UnconvertedSpec, PX extends PropertySpecs<Element>>(
    id: string,
    spec: ComponentSpec<P>,
    properties: PX,
): ElementSelector<HTMLElement, ConvertedSpec<P>&PX>;
export function element(
    id: string,
    typeOrSpec: Type<Element>|ComponentSpec<UnconvertedSpec>,
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
