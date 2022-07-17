import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

const BASE_HEADING = {
  ctor: HTMLHeadingElement,
  spec: ELEMENT_SPEC,
};

export const H1 = createDomRegistration({
  ...BASE_HEADING,
  tag: 'h1',
  namespace: ElementNamespace.HTML,
});
export const H2 = createDomRegistration({
  ...BASE_HEADING,
  tag: 'h2',
  namespace: ElementNamespace.HTML,
});
export const H3 = createDomRegistration({
  ...BASE_HEADING,
  tag: 'h3',
  namespace: ElementNamespace.HTML,
});
export const H4 = createDomRegistration({
  ...BASE_HEADING,
  tag: 'h4',
  namespace: ElementNamespace.HTML,
});
export const H5 = createDomRegistration({
  ...BASE_HEADING,
  tag: 'h5',
  namespace: ElementNamespace.HTML,
});
export const H6 = createDomRegistration({
  ...BASE_HEADING,
  tag: 'h6',
  namespace: ElementNamespace.HTML,
});