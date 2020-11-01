import { Subject } from 'rxjs';
import { Vine } from 'grapevine';

export interface AttributeChangedEvent {
  readonly attrName: string;
}

export interface PersonaContext {
  readonly onAttributeChanged$: Subject<AttributeChangedEvent>;
  readonly shadowRoot: ShadowRoot;
  readonly vine: Vine;
}
