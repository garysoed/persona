import { Observable } from 'rxjs';

import { ShadowRootLike } from './shadow-root-like';

export interface Output<T> {
  output(root: ShadowRootLike, value$: Observable<T>): Observable<unknown>;
}
