import {iattr} from '../input/attr';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';

export const IMG = createDomRegistration({
  ctor: HTMLImageElement,
  spec: {
    ...ELEMENT_SPEC,
    src: iattr('src'),
  },
  tag: 'img',
  namespace: ElementNamespace.HTML,
});
