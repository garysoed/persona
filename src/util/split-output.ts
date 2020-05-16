import { merge, OperatorFunction } from 'rxjs';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';


/**
 * Creates an output that forwards the emission to the given outputs.
 */
export function splitOutput<T>(
    outputs: ReadonlyArray<Output<T>>,
): Output<T> {
  return {
    output(context: PersonaContext): OperatorFunction<T, unknown> {
      return value$ => {
        const obs$ = outputs.map(output => value$.pipe(output.output(context)));
        return merge(...obs$);
      };
    },
  };
}
