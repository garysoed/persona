import {iattr} from '../input/attr';
import {lengthParser} from '../parser/length-parser';
import {listParser} from '../parser/list-parser';
import {numberParser} from '../parser/number-parser';
import {stringEnumParser} from '../parser/string-enum-parser';

export enum LineCap {
  BUTT = 'butt',
  ROUND = 'round',
  SQUARE = 'square',
}

export const PRESENTATIONAL_ATTRIBUTES = {
  stroke: iattr('stroke'),
  strokeDasharray: iattr('stroke-dasharray', listParser(lengthParser())),
  strokeLinecap: iattr(
    'stroke-linecap',
    stringEnumParser<LineCap>(LineCap, 'LineCap'),
  ),
  strokeOpacity: iattr('stroke-opacity', numberParser()),
  strokeWidth: iattr('stroke-width', lengthParser()),
};
