import {Type} from 'gs-types';

import {UnresolvedSpec} from './api';

export interface ComponentSpec<P extends UnresolvedSpec, E> {
  readonly api: P;
  readonly tag: string;
  readonly type?: Type<E>;
}
