import {Config, Vine} from 'grapevine';
import {Subject} from 'rxjs';

import {PersonaContext} from '../core/persona-context';


interface PartialPersonaContext extends Partial<PersonaContext> {
  readonly overrides?: Config['overrides'],
  readonly shadowRoot: ShadowRoot;
}

export function createFakeContext(partial: PartialPersonaContext): PersonaContext {
  return {
    onAttributeChanged$: new Subject(),
    vine: new Vine({appName: 'test', overrides: partial.overrides}),
    ...partial,
  };
}
