import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TEMPLATE = createDomRegistration({
  ctor: HTMLTemplateElement,
  namespace: ElementNamespace.HTML,
  spec: ELEMENT_SPEC,
  tag: 'template',
});
