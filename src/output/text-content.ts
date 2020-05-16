import { combineLatest, OperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class TextContentOutput implements Output<string> {
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

class UnresolvedTextContentOutput implements
    UnresolvedElementProperty<Element, TextContentOutput> {
  resolve(resolver: Resolver<Element>): TextContentOutput {
    return new TextContentOutput(resolver);
  }
}

export function textContent(): UnresolvedTextContentOutput {
  return new UnresolvedTextContentOutput();
}
