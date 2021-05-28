import {instanceofType} from 'gs-types';

import {$elementApi} from './element';

export const $slot = {
  tag: 'slot',
  api: {
    ...$elementApi,
  },
  type: instanceofType(HTMLSlotElement),
};
