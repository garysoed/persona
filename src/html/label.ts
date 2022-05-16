import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const LABEL = createDomRegistration({
  ctor: HTMLLabelElement,
  spec: ELEMENT_SPEC,
  tag: 'label',
});