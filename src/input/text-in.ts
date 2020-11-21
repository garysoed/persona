import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {mutationObservable} from '../util/mutation-observable';


export class TextInput implements Input<string> {
  readonly type = 'inp';

  constructor(readonly resolver: Resolver<Element>) { }

  getValue(context: PersonaContext): Observable<string> {
    const el = this.resolver(context);
    return mutationObservable(el, {characterData: true, childList: true, subtree: true})
        .pipe(
            startWith({}),
            map(() => el.textContent || ''),
        );
  }
}

export class UnresolvedTextInput implements UnresolvedElementProperty<Element, TextInput> {
  resolve(resolver: Resolver<HTMLInputElement>): TextInput {
    return new TextInput(resolver);
  }
}

export function textIn(): UnresolvedTextInput {
  return new UnresolvedTextInput();
}
