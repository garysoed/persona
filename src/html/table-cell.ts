import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TABLE_CELL = createDomRegistration({
  ctor: HTMLTableCellElement,
  spec: ELEMENT_SPEC,
  tag: 'tc',
});