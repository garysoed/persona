import {hasPropertiesType, instanceofType} from 'gs-types';
import {Observable} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';


export interface Input<T> {
  getValue(context: ShadowContext): Observable<T>;
}

export const INPUT_TYPE = hasPropertiesType<Input<any>>({
  getValue: instanceofType(Function),
});
