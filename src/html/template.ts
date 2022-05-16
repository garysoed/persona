import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const TEMPLATE = createDomRegistration({
  ctor: HTMLTemplateElement,
  spec: ELEMENT_SPEC,
  tag: 'template',
});