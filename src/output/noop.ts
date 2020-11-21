import {OperatorFunction, pipe} from 'rxjs';

import {Output} from '../types/output';


class Noop implements Output<any> {
  readonly type = 'out';

  output(): OperatorFunction<any, unknown> {
    return pipe();
  }
}

export function noop(): Output<any> {
  return new Noop();
}
