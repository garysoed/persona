import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const P = createDomRegistration({
  ctor: HTMLParagraphElement,
  spec: ELEMENT_SPEC,
  tag: 'p',
  namespace: ElementNamespace.HTML,
});
