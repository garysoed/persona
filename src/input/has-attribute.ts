import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { Input } from '../types/input';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { mutationObservable } from '../util/mutation-observable';

export class HasAttributeInput implements Input<boolean> {
  constructor(
      readonly attrName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  getValue(root: ShadowRootLike): Observable<boolean> {
    return this.resolver(root)
        .pipe(
            switchMap(el =>
                mutationObservable(
                    el,
                    {
                      attributeFilter: [this.attrName],
                      attributes: true,
                    },
                )
                .pipe(
                    map(() => el.hasAttribute(this.attrName)),
                    startWith(el.hasAttribute(this.attrName)),
                ),
            ),
            distinctUntilChanged(),
            shareReplay(1),
        );
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
