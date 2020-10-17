import { PersonaContext } from '../core/persona-context';

export interface Selector<E extends Element> {
  getElement(context: PersonaContext): E;
}
