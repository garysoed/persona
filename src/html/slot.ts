import {oslotted} from '../output/slotted';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SLOT = createDomRegistration({
  ctor: HTMLSlotElement,
  namespace: ElementNamespace.HTML,
  spec: {
    ...ELEMENT_SPEC,
    slotted: oslotted(),
  },
  tag: 'slot',
});
