import {iflag} from '../input/flag';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';


export const BUTTON = createDomRegistration({
  ctor: HTMLButtonElement,
  spec: {
    autofocus: iflag('autofocus'),
    disabled: iflag('disabled'),
  },
}, ELEMENT);