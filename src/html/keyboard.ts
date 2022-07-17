import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const KBD = createDomRegistration({
  ctor: HTMLElement,
  spec: ELEMENT_SPEC,
  tag: 'kbd',
  namespace: ElementNamespace.HTML,
});