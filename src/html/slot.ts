import {oslotted} from '../output/slotted';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const SLOT = createDomRegistration({
  ctor: HTMLSlotElement,
  spec: {
    slotted: oslotted(),
  },
}, ELEMENT);