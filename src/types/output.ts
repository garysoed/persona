import { Observable } from '@rxjs';

import { ShadowRootLike } from './shadow-root-like';

export interface Output<T> {
  output(root: ShadowRootLike, valueObs: Observable<T>): Observable<unknown>;
}
