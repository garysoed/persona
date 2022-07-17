import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TABLE = createDomRegistration({
  ctor: HTMLTableElement,
  spec: ELEMENT_SPEC,
  tag: 'table',
  namespace: ElementNamespace.HTML,
});