import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const PARAGRAPH = createDomRegistration({
  ctor: HTMLParagraphElement,
  spec: {},
}, ELEMENT);