import {hasPropertiesType, instanceofType} from 'gs-types';
import {OperatorFunction} from 'rxjs';

import {PersonaContext} from '../core/persona-context';


export interface Output<T> {
  output(context: PersonaContext): OperatorFunction<T, unknown>;
}

export const OUTPUT_TYPE = hasPropertiesType<Output<any>>({
  output: instanceofType(Function),
});