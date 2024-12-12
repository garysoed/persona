import {Observable} from 'rxjs';

import {AttributeChangedEvent} from './event';

export type Decorated<E extends HTMLElement> = E & {
  readonly isConnected$: Observable<boolean>;
  readonly onAttributeChange$: Observable<AttributeChangedEvent>;
};
