import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const G = createDomRegistration({
  ctor: SVGGElement,
  namespace: ElementNamespace.SVG,
  spec: {
    ...ELEMENT_SPEC,
  },
  tag: 'g',
});
