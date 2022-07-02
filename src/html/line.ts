import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {listParser} from '../parser/list-parser';
import {numberParser} from '../parser/number-parser';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const LINE = createDomRegistration({
  ctor: SVGLineElement,
  spec: {
    ...ELEMENT_SPEC,
    pathLength: iattr('pathLength', lengthParser()),
    stroke: iattr('stroke'),
    strokeDasharray: iattr('stroke-dasharray', listParser(lengthParser())),
    // TODO: Make stricter
    strokeLinecap: iattr('stroke-linecap'),
    strokeOpacity: iattr('stroke-opacity', numberParser()),
    strokeWidth: iattr('stroke-width', lengthParser()),
    x1: iattr('x1', lengthParser()),
    x2: iattr('x2', lengthParser()),
    y1: iattr('y1', lengthParser()),
    y2: iattr('y2', lengthParser()),
  },
  tag: 'line',
});