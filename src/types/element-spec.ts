import {Vine} from 'grapevine';

import {BaseCtrlCtor} from '../core/base-ctrl';
import {UnresolvedSpec} from '../main/api';

import {CustomElementCtrlCtor} from './custom-element-ctrl';


export interface BaseCustomElementSpec {
  readonly dependencies?: ReadonlyArray<BaseCtrlCtor|CustomElementCtrlCtor>;
  readonly shadowMode?: 'open'|'closed';
  configure?(vine: Vine): void;
}

export interface CustomElementSpec extends BaseCustomElementSpec {
  readonly api: UnresolvedSpec;
  readonly tag: string;
  readonly template: string;
}
