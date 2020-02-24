import { merge, Observable } from 'rxjs';

import { Output } from '../types/output';
import { ShadowRootLike } from '../types/shadow-root-like';


export function splitOutput<T>(
    outputs: ReadonlyArray<Output<T>>,
): Output<T> {
  return {
    output(root: ShadowRootLike, value$: Observable<T>): Observable<unknown> {
      const obs$ = outputs.map(output => output.output(root, value$));
      return merge(...obs$);
    },
  };
}