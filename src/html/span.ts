import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SPAN = createDomRegistration({
  ctor: HTMLSpanElement,
  spec: ELEMENT_SPEC,
  tag: 'span',
  namespace: ElementNamespace.HTML,
});