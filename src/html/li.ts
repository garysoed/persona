import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const LI = createDomRegistration({
  ctor: HTMLLIElement,
  spec: ELEMENT_SPEC,
  tag: 'li',
  namespace: ElementNamespace.HTML,
});
