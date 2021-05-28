import {instanceofType} from 'gs-types';

import {$elementApi} from './element';

export const $input = {
  tag: 'input',
  api: {
    ...$elementApi,
  },
  type: instanceofType(HTMLInputElement),
};
