import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TR = createDomRegistration({
  ctor: HTMLTableRowElement,
  spec: ELEMENT_SPEC,
  tag: 'tr',
  namespace: ElementNamespace.HTML,
});