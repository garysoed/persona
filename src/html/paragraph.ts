import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const PARAGRAPH = createDomRegistration({
  ctor: HTMLParagraphElement,
  spec: ELEMENT_SPEC,
  tag: 'p',
});
