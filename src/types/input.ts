import {Observable} from 'rxjs';

import {PersonaContext} from '../core/persona-context';


export interface Input<T> {
  readonly type: 'inp';

  getValue(context: PersonaContext): Observable<T>;
}
