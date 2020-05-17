import { Vine } from 'grapevine';

import { UnconvertedSpec } from '../main/api';

import { CustomElementCtrlCtor } from './custom-element-ctrl';


export interface BaseCustomElementSpec {
  readonly dependencies?: CustomElementCtrlCtor[];
  readonly shadowMode?: 'open'|'closed';
  configure?(vine: Vine): void;
}

export interface CustomElementSpec extends BaseCustomElementSpec {
  readonly api: UnconvertedSpec;
  readonly tag: string;
  readonly template: string;
}
