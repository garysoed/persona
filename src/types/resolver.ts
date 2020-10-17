import { PersonaContext } from '../core/persona-context';


export type Resolver<E extends Element> = (context: PersonaContext) => E;
