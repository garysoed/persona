import { Vine } from 'grapevine';
import { ReplaySubject, Subject } from 'rxjs';

export interface AttributeChangedEvent {
  readonly attrName: string;
  readonly oldValue: string;
  readonly newValue: string;
}

export interface PersonaContext {
  readonly onAttributeChanged$: Subject<AttributeChangedEvent>;
  readonly onDisconnect$: ReplaySubject<void>;
  readonly shadowRoot: ShadowRoot;
  readonly vine: Vine;
}
