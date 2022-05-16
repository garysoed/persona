import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const CODE = createDomRegistration({
  ctor: HTMLElement,
  spec: ELEMENT_SPEC,
  tag: 'code',
});