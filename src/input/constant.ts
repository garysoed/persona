import {Observable} from 'rxjs';

import {UnresolvedInput} from '../types/unresolved-input';


export type ConstantInput<T> = UnresolvedInput<Element, T>;

export function constant<T>(value$: Observable<T>): ConstantInput<T> {
  return {
    resolve: () => ({
      getValue: () => value$,
    }),
  };
}
