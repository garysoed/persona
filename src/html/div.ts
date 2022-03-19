import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const DIV = createDomRegistration({
  ctor: HTMLDivElement,
  spec: {},
}, ELEMENT);
