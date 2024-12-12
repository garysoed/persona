import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SVG = createDomRegistration({
  ctor: SVGElement,
  namespace: ElementNamespace.SVG,
  spec: {
    ...ELEMENT_SPEC,
    height: iattr('height', lengthParser()),
    width: iattr('width', lengthParser()),
    x: iattr('x', lengthParser()),
    y: iattr('y', lengthParser()),
  },
  tag: 'svg',
});
