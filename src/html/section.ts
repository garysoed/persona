import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const SECTION = createDomRegistration({
  ctor: HTMLElement,
  spec: ELEMENT_SPEC,
  tag: 'section',
});
