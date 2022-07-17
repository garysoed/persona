import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TD = createDomRegistration({
  ctor: HTMLTableCellElement,
  spec: ELEMENT_SPEC,
  tag: 'td',
  namespace: ElementNamespace.HTML,
});