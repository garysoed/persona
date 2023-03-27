import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const UL = createDomRegistration({
  ctor: HTMLUListElement,
  spec: ELEMENT_SPEC,
  tag: 'ul',
  namespace: ElementNamespace.HTML,
});
