import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {listParser} from '../parser/list-parser';
import {numberParser} from '../parser/number-parser';
import {stringEnumParser} from '../parser/string-enum-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';
import {PRESENTATIONAL_ATTRIBUTES} from './presentational-attributes';

export enum AlignmentBaseline {
  AFTER_EDGE = 'after-edge',
  ALPHABETIC = 'alphabetic',
  AUTO = 'auto',
  BASELINE = 'baseline',
  BEFORE_EDGE = 'before-edge',
  BOTTOM = 'bottom',
  CENTER = 'center',
  CENTRAL = 'central',
  HANGING = 'hanging',
  IDEOGRAPHIC = 'ideographic',
  MATHEMATICAL = 'mathematical',
  MIDDLE = 'middle',
  TEXT_AFTER_EDGE = 'text-after-edge',
  TEXT_BEFORE_EDGE = 'text-before-edge',
  TOP = 'top',
}

export enum LengthAdjust {
  SPACING = 'spacing',
  SPACING_AND_GLYPH = 'spacingAndGlyphs',
}

export enum TextAnchor {
  START = 'start',
  MIDDLE = 'middle',
  END = 'end',
}

export const TEXT = createDomRegistration({
  ctor: SVGTextElement,
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
  tag: 'text',
  namespace: ElementNamespace.SVG,
});