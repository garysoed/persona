import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const LABEL = createDomRegistration({
  ctor: HTMLLabelElement,
  spec: {},
}, ELEMENT);