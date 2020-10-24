import { PersonaContext } from '../core/persona-context';

import { Selectable } from './selectable';


export type Resolver<S extends Selectable> = (context: PersonaContext) => S;
