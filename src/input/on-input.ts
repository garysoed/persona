import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class OnInputInput implements Input<string> {
  constructor(
      private readonly options: AddEventListenerOptions,
      readonly resolver: Resolver<HTMLInputElement>,
  ) { }

  getValue(context: PersonaContext): Observable<string> {
    const el = this.resolver(context);
    return fromEvent(el, 'input', this.options) .pipe(map(() => el.value));
  }
}

class UnresolvedOnInputInput implements UnresolvedElementProperty<HTMLInputElement, OnInputInput> {
  constructor(private readonly options: AddEventListenerOptions) { }

  resolve(resolver: Resolver<HTMLInputElement>): OnInputInput {
    return new OnInputInput(this.options, resolver);
  }
}

export function onInput(options: AddEventListenerOptions = {}): UnresolvedOnInputInput {
  return new UnresolvedOnInputInput(options);
}
