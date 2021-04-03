import {hasPropertiesType, instanceofType} from 'gs-types';
import {OperatorFunction} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';


export interface Output<T> {
  output(context: ShadowContext): OperatorFunction<T, unknown>;
}

export const OUTPUT_TYPE = hasPropertiesType<Output<any>>({
  output: instanceofType(Function),
});