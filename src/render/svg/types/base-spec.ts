import {ObservableOrValue} from '../../types/observable-or-value';

export interface BaseSpec {
  readonly children: ObservableOrValue<readonly BaseSpec[]>;
}
