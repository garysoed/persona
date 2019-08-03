import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import { Output } from '../types/output';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class ClassToggleOutput implements Output<boolean> {
  constructor(
      readonly className: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<boolean>): Observable<unknown> {
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

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): ClassToggleOutput {
    return new ClassToggleOutput(this.className, resolver);
  }
}

export function classToggle(className: string): UnresolvedClassToggleOutput {
  return new UnresolvedClassToggleOutput(className);
}
