import {UnconvertedSpec} from './api';

export interface ComponentSpec<P extends UnconvertedSpec> {
  readonly api: P;
  readonly tag: string;
}
