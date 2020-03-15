import { Observable, OperatorFunction, pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Initializable {
  initialize(): Observable<unknown>;
}

export function initialize<T extends Initializable>(): OperatorFunction<T, unknown> {
  return pipe(
      switchMap(obj => obj.initialize()),
  );
}
