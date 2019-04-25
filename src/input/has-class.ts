import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Input } from '../types/input';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { mutationObservable } from '../util/mutation-observable';

export class HasClassInput implements Input<boolean> {
  constructor(
      readonly className: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  getValue(root: ShadowRoot): Observable<boolean> {
    return this.resolver(root)
        .pipe(
            switchMap(el =>
                mutationObservable(
                    el,
                    {
                      attributeFilter: ['class'],
                      attributes: true,
                    },
                )
                .pipe(
                    map(() => el.classList.contains(this.className)),
                    startWith(el.classList.contains(this.className)),
                ),
            ),
            distinctUntilChanged(),
            shareReplay(1),
        );
  }
}

export class UnresolvedHasClassInput implements UnresolvedElementProperty<Element, HasClassInput> {
  constructor(readonly className: string) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): HasClassInput {
    return new HasClassInput(this.className, resolver);
  }
}

export function hasClass(className: string): UnresolvedHasClassInput {
  return new UnresolvedHasClassInput(className);
}
