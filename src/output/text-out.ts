import { combineLatest, OperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { UnresolvedOutput } from '../types/unresolved-output';


export class TextOutput implements Output<string> {
  constructor(
      private readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<string, unknown> {
    return value$ => combineLatest([this.resolver(context), value$])
        .pipe(
            tap(([el, value]) => {
              el.textContent = value;
            }),
        );
  }
}

class UnresolvedTextOutput implements
    UnresolvedElementProperty<Element, TextOutput>, UnresolvedOutput<string> {
  resolve(resolver: Resolver<Element>): TextOutput {
    return new TextOutput(resolver);
  }
}

export function textOut(): UnresolvedTextOutput {
  return new UnresolvedTextOutput();
}
