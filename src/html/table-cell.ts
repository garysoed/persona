import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const TABLE_CELL = createDomRegistration({
  ctor: HTMLTableCellElement,
  spec: {},
}, ELEMENT);