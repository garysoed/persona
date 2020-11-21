import {UnresolvedSpec} from './api';

export interface ComponentSpec<P extends UnresolvedSpec> {
  readonly api: P;
  readonly tag: string;
}
