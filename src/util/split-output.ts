import { merge, OperatorFunction, pipe } from 'rxjs';

import { Output } from '../types/output';
import { ShadowRootLike } from '../types/shadow-root-like';

/**
 * Creates an output that forwards the emission to the given outputs.
 */
export function splitOutput<T>(
    outputs: ReadonlyArray<Output<T>>,
): Output<T> {
  return {
    output(root: ShadowRootLike): OperatorFunction<T, unknown> {
      return value$ => {
        const obs$ = outputs.map(output => value$.pipe(output.output(root)));
        return merge(...obs$);
      };
    },
  };
}
