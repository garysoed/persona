import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SVG = createDomRegistration({
  ctor: SVGElement,
  spec: {
    ...ELEMENT_SPEC,
    x: iattr('x', lengthParser()),
    y: iattr('y', lengthParser()),
    width: iattr('width', lengthParser()),
    height: iattr('height', lengthParser()),
  },
  tag: 'svg',
  namespace: ElementNamespace.HTML,
});