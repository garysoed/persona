import {Observable} from 'rxjs';

import {Input} from '../types/input';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';


export type ConstantInput<T> = UnresolvedElementProperty<Element, Input<T>>;

export function constant<T>(value$: Observable<T>): ConstantInput<T> {
  return {
    resolve: () => ({
      getValue: () => value$,
    }),
  };
}
