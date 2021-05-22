import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedOutput} from '../types/unresolved-output';


export class ClassToggleOutput implements Output<boolean> {
  readonly type = 'out';

  constructor(
      readonly className: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: ShadowContext): OperatorFunction<boolean, unknown> {
    return pipe(
        tap(value => {
          const el = this.resolver(context);
          el.classList.toggle(this.className, value);
        }),
    );
  }
}

export class UnresolvedClassToggleOutput implements UnresolvedOutput<Element, boolean> {
  constructor(readonly className: string) { }

  resolve(resolver: Resolver<Element>): ClassToggleOutput {
    return new ClassToggleOutput(this.className, resolver);
  }
}

export function classToggle(className: string): UnresolvedClassToggleOutput {
  return new UnresolvedClassToggleOutput(className);
}
