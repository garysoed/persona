import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const SPAN = createDomRegistration({
  ctor: HTMLSpanElement,
  spec: {},
}, ELEMENT);