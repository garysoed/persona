import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
import {numberParser} from '../parser/number-parser';
import {stringEnumParser} from '../parser/string-enum-parser';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';
import {AutocompleteType} from './types/autocomplete-type';

export enum InputType {
  EMAIL = 'email',
  TEL = 'tel',
  TEXT = 'text',
  URL = 'url',
}

export const INPUT = createDomRegistration({
  ctor: HTMLInputElement,
  namespace: ElementNamespace.HTML,
  spec: {
    ...ELEMENT_SPEC,
    autocomplete: iattr(
      'autocomplete',
      stringEnumParser<AutocompleteType>(AutocompleteType, 'AutocompleteType'),
    ),
    autofocus: iflag('autofocus'),
    disabled: iflag('disabled'),
    max: iattr('max', numberParser()),
    min: iattr('min', numberParser()),
    step: iattr('step', numberParser()),
    type: iattr('type'),
  },
  tag: 'input',
});
