import {diff} from 'gs-tools/export/util';
import {OperatorFunction} from 'rxjs';
import {pairwise, startWith, tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedOutput} from '../types/unresolved-output';


export class ClasslistOutput implements Output<ReadonlySet<string>> {
  readonly type = 'out';

  constructor(
      private readonly resolver: Resolver<Element>,
  ) { }

  output(context: ShadowContext): OperatorFunction<ReadonlySet<string>, unknown> {
    return value$ => value$.pipe(
        startWith(new Set<string>()),
        pairwise(),
        tap(([prevClasses, currClasses]) => {
          const el = this.resolver(context);
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

class UnresolvedClasslistOutput implements UnresolvedOutput<Element, ReadonlySet<string>> {
  resolve(resolver: Resolver<Element>): ClasslistOutput {
    return new ClasslistOutput(resolver);
  }
}

export function classlist(): UnresolvedClasslistOutput {
  return new UnresolvedClasslistOutput();
}
