import {ObservableOrValue} from '../../types/observable-or-value';

import {BaseSpec} from './base-spec';

interface BaseSvgSpec extends BaseSpec {
  readonly height: ObservableOrValue<string>;
  readonly width: ObservableOrValue<string>;

}

export interface SvgSpec extends BaseSpec {
}

export interface SvgRootSpec extends SvgSpec {

}
