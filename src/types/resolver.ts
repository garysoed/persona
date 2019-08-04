import { Observable } from '@rxjs';

import { ShadowRootLike } from './shadow-root-like';

export type Resolver<E extends Element> = (root: ShadowRootLike) => Observable<E>;
