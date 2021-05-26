import {hasPropertiesType, instanceofType, Type} from 'gs-types';

import {Input} from './input';
import {Output} from './output';
import {Resolver} from './resolver';
import {Selectable} from './selectable';

export interface UnresolvedElementProperty<
    S extends Selectable,
    R extends Output<any>|Input<any>> {
  resolve(resolver: Resolver<S>): R;
}

export const UNRESOLVED_ELEMENT_PROPERTY_TYPE:
    Type<UnresolvedElementProperty<Selectable, Output<unknown>|Input<unknown>>>
    = hasPropertiesType({
      resolve: instanceofType(Function),
    });