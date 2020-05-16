import { OperatorFunction, pipe } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class ClassToggleOutput implements Output<boolean> {
  constructor(
      readonly className: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<boolean, unknown> {
    return pipe(
        withLatestFrom(this.resolver(context)),
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
