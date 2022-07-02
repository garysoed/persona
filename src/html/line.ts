import {reverse} from 'nabu';

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
    pathLength: iattr('pathLength', reverse(lengthParser())),
    stroke: iattr('stroke'),
    strokeDasharray: iattr('stroke-dasharray', reverse(listParser(lengthParser()))),
    // TODO: Make stricter
    strokeLinecap: iattr('stroke-linecap'),
    strokeOpacity: iattr('stroke-opacity', reverse(numberParser())),
    strokeWidth: iattr('stroke-width', reverse(lengthParser())),
    x1: iattr('x1', reverse(lengthParser())),
    x2: iattr('x2', reverse(lengthParser())),
    y1: iattr('y1', reverse(lengthParser())),
    y2: iattr('y2', reverse(lengthParser())),
  },
  tag: 'line',
});