import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const OL = createDomRegistration({
  ctor: HTMLOListElement,
  spec: ELEMENT_SPEC,
  tag: 'ol',
  namespace: ElementNamespace.HTML,
});
