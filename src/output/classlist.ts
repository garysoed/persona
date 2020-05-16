import { diff } from 'gs-tools/export/util';
import { combineLatest, OperatorFunction } from 'rxjs';
import { pairwise, startWith, tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class ClasslistOutput implements Output<ReadonlySet<string>> {
  constructor(
      private readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<ReadonlySet<string>, unknown> {
    return value$ => combineLatest([
          this.resolver(context),
          value$.pipe(startWith(new Set<string>()), pairwise()),
        ])
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
  resolve(resolver: Resolver<Element>): ClasslistOutput {
    return new ClasslistOutput(resolver);
  }
}

export function classlist(): UnresolvedClasslistOutput {
  return new UnresolvedClasslistOutput();
}
