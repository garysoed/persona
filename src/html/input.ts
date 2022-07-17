import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
import {ElementNamespace} from '../types/registration';

import {createDomRegistration} from './create-dom-registration';
import {ELEMENT_SPEC} from './element';


export enum AutocompleteType {
  ADDITIONAL_NAME = 'additional-name',
  CURRENT_PASSWORD = 'current-password',
  EMAIL = 'email',
  FAMILY_NAME = 'family-name',
  GIVEN_NAME = 'given-name',
  HONORIFIC_PREFIX = 'honorific-prefix',
  HONORIFIC_SUFFIX = 'honorific-suffix',
  NAME = 'name',
  NEW_PASSWORD = 'new-password',
  NICKNAME = 'nickname',
  OFF = 'off',
  ON = 'on',
  ONE_TIME_CODE = 'one-time-code',
  ORGANIZATION = 'organization',
  ORGANIZATTION_TITLE = 'organization-title',
  USERNAME = 'username',
}

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
    autocomplete: iattr('autocomplete'),
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
