import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TD = createDomRegistration({
  ctor: HTMLTableCellElement,
  namespace: ElementNamespace.HTML,
  spec: ELEMENT_SPEC,
  tag: 'td',
});
