import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const DIV = createDomRegistration({
  ctor: HTMLDivElement,
  namespace: ElementNamespace.HTML,
  spec: ELEMENT_SPEC,
  tag: 'div',
});
