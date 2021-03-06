import {hasPropertiesType, instanceofType, Type} from 'gs-types';
import {Observable} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';


export interface Input<T> {
  getValue(context: ShadowContext): Observable<T>;
}

export const INPUT_TYPE: Type<Input<unknown>> = hasPropertiesType<Input<unknown>>({
  getValue: instanceofType(Function),
});
