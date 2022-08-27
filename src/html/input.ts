import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
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
  spec: {
    ...ELEMENT_SPEC,
    autocomplete: iattr('autocomplete', stringEnumParser<AutocompleteType>(AutocompleteType)),
    autofocus: iflag('autofocus'),
    disabled: iflag('disabled'),
    max: iattr('max'),
    min: iattr('min'),
    step: iattr('step'),
    type: iattr('type'),
  },
  tag: 'input',
  namespace: ElementNamespace.HTML,
});
