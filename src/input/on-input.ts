import {Observable, fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedInput} from '../types/unresolved-input';


export class OnInputInput implements Input<string> {
  constructor(
      private readonly options: AddEventListenerOptions,
      readonly resolver: Resolver<HTMLInputElement>,
  ) { }

  getValue(context: ShadowContext): Observable<string> {
    const el = this.resolver(context);
    return fromEvent(el, 'input', this.options) .pipe(map(() => el.value));
  }
}

class UnresolvedOnInputInput implements UnresolvedInput<HTMLInputElement, string> {
  constructor(private readonly options: AddEventListenerOptions) { }

  resolve(resolver: Resolver<HTMLInputElement>): OnInputInput {
    return new OnInputInput(this.options, resolver);
  }
}

export function onInput(options: AddEventListenerOptions = {}): UnresolvedOnInputInput {
  return new UnresolvedOnInputInput(options);
}
