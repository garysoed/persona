import {Observable} from 'rxjs';

import {AttributeChangedEvent} from '../../export';

export type Decorated<E extends HTMLElement> = E & {
  readonly isConnected$: Observable<boolean>;
  readonly onAttributeChange$: Observable<AttributeChangedEvent>;
};