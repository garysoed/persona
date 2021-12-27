import {instanceofType} from 'gs-types';

import {stringParser} from '../../src-next/util/parsers';
import {attribute} from '../input/attribute';

import {$elementApi} from './element';

export const $slot = {
  tag: 'slot',
  api: {
    ...$elementApi,
    slotName: attribute('name', stringParser(), ''),
  },
  type: instanceofType(HTMLSlotElement),
};
