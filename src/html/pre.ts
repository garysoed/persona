import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const PRE = createDomRegistration({
  ctor: HTMLPreElement,
  spec: {},
}, ELEMENT);