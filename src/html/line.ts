import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';
import {PRESENTATIONAL_ATTRIBUTES} from './presentational-attributes';


export const LINE = createDomRegistration({
  ctor: SVGLineElement,
  spec: {
    ...ELEMENT_SPEC,
    ...PRESENTATIONAL_ATTRIBUTES,
    pathLength: iattr('pathLength', lengthParser()),
    x1: iattr('x1', lengthParser()),
    x2: iattr('x2', lengthParser()),
    y1: iattr('y1', lengthParser()),
    y2: iattr('y2', lengthParser()),
  },
  tag: 'line',
  namespace: ElementNamespace.SVG,
});