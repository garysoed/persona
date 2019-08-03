import { createImmutableSet } from '@gs-tools/collect';
import { diff } from '@gs-tools/util';
import { combineLatest, Observable } from '@rxjs';
import { pairwise, startWith, tap } from '@rxjs/operators';

import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class ClasslistOutput implements Output<Iterable<string>> {
  constructor(
      private readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<Iterable<string>>): Observable<unknown> {
    return combineLatest(
            this.resolver(root),
            valueObs.pipe(startWith(createImmutableSet<string>()), pairwise()),
        )
        .pipe(
            tap(([el, [prevClasses, currClasses]]) => {
              const {added, deleted} = diff(prevClasses, currClasses);

              for (const item of added) {
                el.classList.add(item);
              }

              for (const item of deleted) {
                el.classList.remove(item);
              }
            }),
        );
  }
}

class UnresolvedClasslistOutput implements
    UnresolvedElementProperty<Element, ClasslistOutput> {
  resolve(resolver: (root: ShadowRoot) => Observable<Element>): ClasslistOutput {
    return new ClasslistOutput(resolver);
  }
}

export function classlist(): UnresolvedClasslistOutput {
  return new UnresolvedClasslistOutput();
}
