import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const HEADING = createDomRegistration({
  ctor: HTMLHeadingElement,
  spec: {},
}, ELEMENT);