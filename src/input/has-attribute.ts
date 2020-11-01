import { Input } from '../types/input';
import { Observable, defer } from 'rxjs';
import { PersonaContext } from '../core/persona-context';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';
import { mutationObservable } from '../util/mutation-observable';



export class HasAttributeInput implements Input<boolean> {
  constructor(
      readonly attrName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(context: PersonaContext): Observable<boolean> {
    return defer(() => {
      const el = this.resolver(context);
      return mutationObservable(
          el,
          {
            attributeFilter: [this.attrName],
            attributes: true,
          },
      )
          .pipe(
              map(() => el.hasAttribute(this.attrName)),
              startWith(el.hasAttribute(this.attrName)),
              distinctUntilChanged(),
              shareReplay(1),
          );
    });
  }
}

export class UnresolvedHasAttributeInput implements
    UnresolvedElementProperty<Element, HasAttributeInput> {
  constructor(readonly attrName: string) { }

  resolve(resolver: Resolver<Element>): HasAttributeInput {
    return new HasAttributeInput(this.attrName, resolver);
  }
}

export function hasAttribute(attrName: string): UnresolvedHasAttributeInput {
  return new UnresolvedHasAttributeInput(attrName);
}
