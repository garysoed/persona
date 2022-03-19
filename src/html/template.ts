import {createDomRegistration} from './create-dom-registration';
import {ELEMENT} from './element';

export const TEMPLATE = createDomRegistration({
  ctor: HTMLTemplateElement,
  spec: {},
}, ELEMENT);