import { Observable, defer } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { Input } from '../types/input';
import { PersonaContext } from '../core/persona-context';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { mutationObservable } from '../util/mutation-observable';


export class HasClassInput implements Input<boolean> {
  constructor(
      readonly className: string,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<boolean> {
    return defer(() => {
      const el = this.resolver(context);
      return mutationObservable(
          el,
          {
            attributeFilter: ['class'],
            attributes: true,
          },
      )
          .pipe(
              map(() => el.classList.contains(this.className)),
              startWith(el.classList.contains(this.className)),
              distinctUntilChanged(),
              shareReplay(1),
          );
    });
  }
}

export class UnresolvedHasClassInput implements UnresolvedElementProperty<Element, HasClassInput> {
  constructor(readonly className: string) { }

  resolve(resolver: Resolver<Element>): HasClassInput {
    return new HasClassInput(this.className, resolver);
  }
}

export function hasClass(className: string): UnresolvedHasClassInput {
  return new UnresolvedHasClassInput(className);
}
