import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const DIV = createDomRegistration({
  ctor: HTMLDivElement,
  tag: 'div',
  spec: ELEMENT_SPEC,
  namespace: ElementNamespace.HTML,
});
