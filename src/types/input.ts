import { Observable } from 'rxjs';

import { PersonaContext } from '../core/persona-context';


export interface Input<T> {
  getValue(context: PersonaContext): Observable<T>;
}
