import { PersonaContext } from '../core/persona-context';

import { Selectable } from './selectable';

export interface Selector<S extends Selectable> {
  getSelectable(context: PersonaContext): S;
}
