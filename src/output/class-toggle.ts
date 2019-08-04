import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { ShadowRootLike } from '../types/shadow-root-like';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class ClassToggleOutput implements Output<boolean> {
  constructor(
      readonly className: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(root: ShadowRootLike, valueObs: Observable<boolean>): Observable<unknown> {
    return valueObs
        .pipe(
            withLatestFrom(this.resolver(root)),
            tap(([value, el]) => {
              el.classList.toggle(this.className, value);
            }),
        );
  }
}

export class UnresolvedClassToggleOutput
    implements UnresolvedElementProperty<Element, ClassToggleOutput> {
  constructor(readonly className: string) { }

  resolve(resolver: Resolver<Element>): ClassToggleOutput {
    return new ClassToggleOutput(this.className, resolver);
  }
}

export function classToggle(className: string): UnresolvedClassToggleOutput {
  return new UnresolvedClassToggleOutput(className);
}
