import {OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {UnresolvedOutput} from '../types/unresolved-output';


export class TextOutput implements Output<string> {
  readonly type = 'out';

  constructor(
      private readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<string, unknown> {
    return value$ => value$
        .pipe(
            tap(value => {
              const el = this.resolver(context);
              el.textContent = value;
            }),
        );
  }
}

export class UnresolvedTextOutput implements
    UnresolvedElementProperty<Element, TextOutput>, UnresolvedOutput<string> {
  resolve(resolver: Resolver<Element>): TextOutput {
    return new TextOutput(resolver);
  }
}

export function textOut(): UnresolvedTextOutput {
  return new UnresolvedTextOutput();
}
