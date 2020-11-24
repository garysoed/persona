import {hasPropertiesType, instanceofType} from 'gs-types';
import {Observable} from 'rxjs';

import {PersonaContext} from '../core/persona-context';


export interface Input<T> {
  getValue(context: PersonaContext): Observable<T>;
}

export const INPUT_TYPE = hasPropertiesType<Input<any>>({
  getValue: instanceofType(Function),
});
