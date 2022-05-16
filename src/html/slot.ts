import {oslotted} from '../output/slotted';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SLOT = createDomRegistration({
  ctor: HTMLSlotElement,
  spec: {
    ...ELEMENT_SPEC,
    slotted: oslotted(),
  },
  tag: 'slot',
});