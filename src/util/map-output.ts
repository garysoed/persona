import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';


/**
 * Creates an output that forwards the emission to the given output, after going through a map.
 */
export function mapOutput<A, B>(
    output: Output<A>,
    mapFn: (value: B) => A,
): Output<B> {
  return {
    output(context: PersonaContext): OperatorFunction<B, unknown> {
      return pipe(
          map(mapFn),
          output.output(context),
      );
    },
  };
}
