import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

const BASE_TABLE_SECTION = {
  ctor: HTMLTableSectionElement,
  spec: ELEMENT_SPEC,
};

export const TBODY = createDomRegistration({
  ...BASE_TABLE_SECTION,
  tag: 'tbody',
  namespace: ElementNamespace.HTML,
});

export const THEAD = createDomRegistration({
  ...BASE_TABLE_SECTION,
  tag: 'thead',
  namespace: ElementNamespace.HTML,
});