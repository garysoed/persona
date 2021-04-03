import {Config, Vine} from 'grapevine';
import {Subject} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';


interface PartialShadowContext extends Partial<ShadowContext> {
  readonly overrides?: Config['overrides'],
  readonly shadowRoot: ShadowRoot;
}

export function createFakeContext(partial: PartialShadowContext): ShadowContext {
  return {
    onAttributeChanged$: new Subject(),
    vine: new Vine({appName: 'test', overrides: partial.overrides}),
    ...partial,
  };
}
