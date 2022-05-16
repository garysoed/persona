import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SVG = createDomRegistration({
  ctor: SVGElement,
  spec: ELEMENT_SPEC,
  tag: 'svg',
});