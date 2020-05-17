import { Converter } from 'nabu';
import { Observable, of as observableOf } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { AttributeInput } from '../input/attribute';
import { Input } from '../types/input';


export class HostAttribute<T> extends AttributeInput<T> implements Input<T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T,
  ) {
    super(attrName, parser, defaultValue, ({shadowRoot}) => observableOf(shadowRoot.host));
  }

  protected getAttributeValue(context: PersonaContext): Observable<string> {
    return context.onAttributeChanged$.pipe(
        filter(({attrName}) => attrName === this.attrName),
        startWith({}),
        map(() => context.shadowRoot.host.getAttribute(this.attrName) || ''),
    );
  }
}
