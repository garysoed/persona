import {iattr} from '../input/attr';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

// TODO: Add better typing to the attrs
export const SVG = createDomRegistration({
  ctor: SVGElement,
  spec: {
    ...ELEMENT_SPEC,
    x: iattr('x'),
    y: iattr('y'),
    width: iattr('width'),
    height: iattr('height'),
  },
  tag: 'svg',
  namespace: ElementNamespace.HTML,
});