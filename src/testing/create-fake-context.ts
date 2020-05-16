import { Vine } from 'grapevine';
import { ReplaySubject, Subject } from 'rxjs';

import { PersonaContext } from '../core/persona-context';

type PartialPersonaContext = Partial<PersonaContext> & {
  readonly shadowRoot: ShadowRoot;
};

export function createFakeContext(partial: PartialPersonaContext): PersonaContext {
  return {
    ...partial,
    onAttributeChanged$: new Subject(),
    onDisconnect$: new ReplaySubject<void>(1),
    vine: new Vine('test'),
  };
}
