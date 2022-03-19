import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const TABLE = createDomRegistration({
  ctor: HTMLTableElement,
  spec: {},
}, ELEMENT);