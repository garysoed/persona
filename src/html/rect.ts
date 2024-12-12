import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';
import {PRESENTATIONAL_ATTRIBUTES} from './presentational-attributes';

export const RECT = createDomRegistration({
  ctor: SVGRectElement,
  namespace: ElementNamespace.SVG,
  spec: {
    ...ELEMENT_SPEC,
    ...PRESENTATIONAL_ATTRIBUTES,
    height: iattr('height', lengthParser()),
    rx: iattr('rx', lengthParser()),
    ry: iattr('ry', lengthParser()),
    width: iattr('width', lengthParser()),
    x: iattr('x', lengthParser()),
    y: iattr('y', lengthParser()),
  },
  tag: 'rect',
});
