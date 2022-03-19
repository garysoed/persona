import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const TABLE_ROW = createDomRegistration({
  ctor: HTMLTableRowElement,
  spec: {},
}, ELEMENT);