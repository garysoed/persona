import {Vine} from 'grapevine';
import {Subject} from 'rxjs';

export interface AttributeChangedEvent {
  readonly attrName: string;
}

export interface PersonaContext {
  readonly onAttributeChanged$: Subject<AttributeChangedEvent>;
  readonly shadowRoot: ShadowRoot;
  readonly vine: Vine;
}
