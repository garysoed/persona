import { Observable, OperatorFunction } from 'rxjs';

import { ShadowRootLike } from './shadow-root-like';

export interface Output<T> {
  output(root: ShadowRootLike): OperatorFunction<T, unknown>;
}
