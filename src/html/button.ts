import {iflag} from '../input/flag';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';


export const BUTTON = createDomRegistration({
  ctor: HTMLButtonElement,
  spec: {
    ...ELEMENT_SPEC,
    autofocus: iflag('autofocus'),
    disabled: iflag('disabled'),
  },
  tag: 'button',
  namespace: ElementNamespace.HTML,
});