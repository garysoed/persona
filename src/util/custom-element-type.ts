import {elementWithTagType, Type} from 'gs-types';

import {Registration} from '../types/registration';

export function customElementType<E extends HTMLElement>(registration: Registration<E, any>): Type<E> {
  return elementWithTagType(registration.tag) as Type<E>;
}