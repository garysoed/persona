import {instanceofType} from 'gs-types';

import {attribute} from '../input/attribute';
import {stringParser} from '../util/parsers';

import {$elementApi} from './element';

export const $slot = {
  tag: 'slot',
  api: {
    ...$elementApi,
    slotName: attribute('name', stringParser(), ''),
  },
  type: instanceofType(HTMLSlotElement),
};
