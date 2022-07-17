import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const PRE = createDomRegistration({
  ctor: HTMLPreElement,
  spec: ELEMENT_SPEC,
  tag: 'pre',
  namespace: ElementNamespace.HTML,
});