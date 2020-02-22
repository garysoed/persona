import { Observable } from 'rxjs';

import { ShadowRootLike } from './shadow-root-like';

export interface Input<T> {
  getValue(root: ShadowRootLike): Observable<T>;
}
