import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { HasAttributeInput } from '../input/has-attribute';
import { Input } from '../types/input';


export class HostHasAttribute extends HasAttributeInput implements Input<boolean> {
  constructor(
      readonly attrName: string,
  ) {
    super(attrName, ({shadowRoot}) => shadowRoot.host);
  }

  getValue(context: PersonaContext): Observable<boolean> {
    return context.onAttributeChanged$.pipe(
        filter(({attrName}) => attrName === this.attrName),
        startWith({}),
        map(() => context.shadowRoot.host.hasAttribute(this.attrName)),
    );
  }
}
