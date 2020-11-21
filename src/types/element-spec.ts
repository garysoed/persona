import {Vine} from 'grapevine';

import {UnresolvedSpec} from '../main/api';

import {CustomElementCtrlCtor} from './custom-element-ctrl';


export interface BaseCustomElementSpec {
  readonly dependencies?: CustomElementCtrlCtor[];
  readonly shadowMode?: 'open'|'closed';
  configure?(vine: Vine): void;
}

export interface CustomElementSpec extends BaseCustomElementSpec {
  readonly api: UnresolvedSpec;
  readonly tag: string;
  readonly template: string;
}
