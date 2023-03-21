import {elementWithTagType, Type} from 'gs-types';

import {CustomElementRegistration} from '../types/registration';


export function customElementType<E extends HTMLElement>(
    registration: CustomElementRegistration<E, any>,
): Type<E> {
  return elementWithTagType(registration.tag) as Type<E>;
}