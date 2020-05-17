import { Errors } from 'gs-tools/export/error';
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
      readonly defaultValue: T|undefined,
  ) {
    super(attrName, parser, defaultValue, ({shadowRoot}) => observableOf(shadowRoot.host));
  }

  getValue(context: PersonaContext): Observable<T> {
    return context.onAttributeChanged$.pipe(
        filter(({attrName}) => attrName === this.attrName),
        map(({newValue}) => newValue),
        startWith(context.shadowRoot.host.getAttribute(this.attrName)),
        map(unparsed => {
          const parseResult = unparsed === null ?
              {success: false as false} : this.parser.convertBackward(unparsed);
          if (!parseResult.success) {
            if (this.defaultValue !== undefined) {
              return this.defaultValue;
            } else {
              throw Errors.assert(`Value of ${this.attrName}`)
                  .shouldBe('parsable')
                  .butWas(unparsed);
            }
          }

          return parseResult.result;
        }),
    );
  }
}
