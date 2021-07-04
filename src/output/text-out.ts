import {OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedOutput} from '../types/unresolved-output';


export class TextOutput implements Output<string> {
  readonly type = 'out';

  constructor(
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: ShadowContext): OperatorFunction<string, unknown> {
    return value$ => value$
        .pipe(
            tap(value => {
              const el = this.resolver(context);
              el.textContent = value;

              // TODO: Make this a fake.
              const record = {};
              el.dispatchEvent(new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record}}));
            }),
        );
  }
}

export class UnresolvedTextOutput implements UnresolvedOutput<Element, string> {
  resolve(resolver: Resolver<Element>): TextOutput {
    return new TextOutput(resolver);
  }
}

export function textOut(): UnresolvedTextOutput {
  return new UnresolvedTextOutput();
}
