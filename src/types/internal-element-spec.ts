import {Selectable} from './selectable';
import {Selector} from './selector';

export interface InternalElementSpec {
  readonly [key: string]: Selector<Selectable>;
}
