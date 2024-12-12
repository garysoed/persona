import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

const BASE_HEADING = {
  ctor: HTMLHeadingElement,
  spec: ELEMENT_SPEC,
};

export const H1 = createDomRegistration({
  ...BASE_HEADING,
  namespace: ElementNamespace.HTML,
  tag: 'h1',
});
export const H2 = createDomRegistration({
  ...BASE_HEADING,
  namespace: ElementNamespace.HTML,
  tag: 'h2',
});
export const H3 = createDomRegistration({
  ...BASE_HEADING,
  namespace: ElementNamespace.HTML,
  tag: 'h3',
});
export const H4 = createDomRegistration({
  ...BASE_HEADING,
  namespace: ElementNamespace.HTML,
  tag: 'h4',
});
export const H5 = createDomRegistration({
  ...BASE_HEADING,
  namespace: ElementNamespace.HTML,
  tag: 'h5',
});
export const H6 = createDomRegistration({
  ...BASE_HEADING,
  namespace: ElementNamespace.HTML,
  tag: 'h6',
});
