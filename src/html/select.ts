import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
import {numberParser} from '../parser/number-parser';
import {stringEnumParser} from '../parser/string-enum-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';
import {AutocompleteType} from './types/autocomplete-type';

export const SELECT = createDomRegistration({
  ctor: HTMLSelectElement,
  spec: {
    ...ELEMENT_SPEC,
    autocomplete: iattr('autocomplete', stringEnumParser<AutocompleteType>(AutocompleteType)),
    autofocus: iflag('autofocus'),
    disabled: iflag('disabled'),
    multiple: iflag('multiple'),
    size: iattr('size', numberParser()),
  },
  tag: 'select',
  namespace: ElementNamespace.HTML,
});
