import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const TABLE_SECTION = createDomRegistration({
  ctor: HTMLTableSectionElement,
  spec: {},
}, ELEMENT);