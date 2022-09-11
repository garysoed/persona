import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {listParser} from '../parser/list-parser';
import {numberParser} from '../parser/number-parser';
import {stringEnumParser} from '../parser/string-enum-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';
import {PRESENTATIONAL_ATTRIBUTES} from './presentational-attributes';
import {AlignmentBaseline} from './types/alignment-baseline';
import {LengthAdjust} from './types/length-adjust';
import {TextAnchor} from './types/text-anchor';


export const TSPAN = createDomRegistration({
  ctor: SVGTSpanElement,
  spec: {
    ...ELEMENT_SPEC,
    ...PRESENTATIONAL_ATTRIBUTES,
    dx: iattr('dx', lengthParser()),
    dy: iattr('dy', lengthParser()),
    alignmentBaseline: iattr('alignment-baseline', stringEnumParser<AlignmentBaseline>(AlignmentBaseline)),
    fontFamily: iattr('font-family'),
    fontSize: iattr('font-size', lengthParser()),
    lengthAdjust: iattr('lengthAdjust', stringEnumParser<LengthAdjust>(LengthAdjust)),
    rotate: iattr('rotate', listParser(numberParser())),
    textAnchor: iattr('text-anchor', stringEnumParser<TextAnchor>(TextAnchor)),
    textLength: iattr('textLength', lengthParser()),
    x: iattr('x', lengthParser()),
    y: iattr('y', lengthParser()),
  },
  tag: 'tspan',
  namespace: ElementNamespace.SVG,
});