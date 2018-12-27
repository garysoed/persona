import { ImmutableSet } from 'gs-tools/export/collect';
import { diff } from 'gs-tools/export/util';
import { combineLatest, Observable } from 'rxjs';
import { pairwise, startWith, tap } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class ClasslistOutput implements Output<Iterable<string>> {
  constructor(
      private readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<Iterable<string>>): Observable<unknown> {
    return combineLatest(
            this.resolver(root),
            valueObs.pipe(startWith(ImmutableSet.of<string>()), pairwise()),
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
