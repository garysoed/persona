import { OperatorFunction } from 'rxjs';

import { PersonaContext } from '../core/persona-context';


export interface Output<T> {
  output(context: PersonaContext): OperatorFunction<T, unknown>;
}
