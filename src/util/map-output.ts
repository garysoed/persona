import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { Output } from '../types/output';
import { ShadowRootLike } from '../types/shadow-root-like';

/**
 * Creates an output that forwards the emission to the given output, after going through a map.
 */
export function mapOutput<A, B>(
    output: Output<A>,
    mapFn: (value: B) => A,
): Output<B> {
  return {
    output(root: ShadowRootLike): OperatorFunction<B, unknown> {
      return pipe(
          map(mapFn),
          output.output(root),
      );
    },
  };
}
