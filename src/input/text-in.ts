import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedInput} from '../types/unresolved-input';
import {mutationObservable} from '../util/mutation-observable';


export class TextInput implements Input<string> {
  constructor(readonly resolver: Resolver<Element>) { }

  getValue(context: ShadowContext): Observable<string> {
    const el = this.resolver(context);
    return mutationObservable(el, {characterData: true, childList: true, subtree: true})
        .pipe(
            startWith({}),
            map(() => el.textContent ?? ''),
        );
  }
}

export class UnresolvedTextInput implements UnresolvedInput<Element, string> {
  resolve(resolver: Resolver<HTMLInputElement>): TextInput {
    return new TextInput(resolver);
  }
}

export function textIn(): UnresolvedTextInput {
  return new UnresolvedTextInput();
}
