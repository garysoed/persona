import { EMPTY, Observable } from 'rxjs';

import { Output } from '../types/output';

class Noop implements Output<any> {
  output(): Observable<unknown> {
    return EMPTY;
  }
}

export function noop(): Output<any> {
  return new Noop();
}
