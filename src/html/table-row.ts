import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TABLE_ROW = createDomRegistration({
  ctor: HTMLTableRowElement,
  spec: ELEMENT_SPEC,
  tag: 'tr',
});