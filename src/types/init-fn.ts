import { Vine } from '@grapevine';
import { Observable } from '@rxjs';

export type InitFn = (vine: Vine, root: ShadowRoot) => Observable<unknown>;
