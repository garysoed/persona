import {Vine} from 'grapevine';
import {Subject} from 'rxjs';

import {PersonaContext} from '../core/persona-context';


type PartialPersonaContext = Partial<PersonaContext> & {
  readonly shadowRoot: ShadowRoot;
};

export function createFakeContext(partial: PartialPersonaContext): PersonaContext {
  return {
    onAttributeChanged$: new Subject(),
    vine: new Vine('test'),
    ...partial,
  };
}
