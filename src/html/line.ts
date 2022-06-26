import {iattr} from '../input/attr';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const LINE = createDomRegistration({
  ctor: SVGLineElement,
  spec: {
    ...ELEMENT_SPEC,
    pathLength: iattr('pathLength'),
    stroke: iattr('stroke'),
    strokeDasharray: iattr('stroke-dasharray'),
    strokeLinecap: iattr('stroke-linecap'),
    strokeOpacity: iattr('stroke-opacity'),
    strokeWidth: iattr('stroke-width'),
    x1: iattr('x1'),
    x2: iattr('x2'),
    y1: iattr('y1'),
    y2: iattr('y2'),
  },
  tag: 'line',
});