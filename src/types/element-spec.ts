import {Vine} from 'grapevine';

import {BaseCtrlCtor} from '../core/base-ctrl';
import {UnresolvedSpec} from '../main/api';


export interface BaseCustomElementSpec {
  readonly dependencies?: ReadonlyArray<BaseCtrlCtor<{}>>;
  readonly shadowMode?: 'open'|'closed';
  configure?(vine: Vine): void;
}

export interface CustomElementSpec extends BaseCustomElementSpec {
  readonly api: UnresolvedSpec;
  readonly tag: string;
  readonly template: string;
}
