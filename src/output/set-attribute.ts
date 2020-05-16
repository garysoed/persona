import { OperatorFunction, pipe } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Output } from '../types/output';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


export class SetAttributeOutput implements Output<boolean> {
  constructor(
      readonly attrName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<boolean, unknown> {
    return pipe(
        withLatestFrom(this.resolver(context)),
        tap(([value, el]) => {
          if (value) {
            el.setAttribute(this.attrName, '');
          } else {
            el.removeAttribute(this.attrName);
          }
        }),
    );
  }
}

export class UnresolvedSetAttributeOutput implements
    UnresolvedElementProperty<Element, SetAttributeOutput> {
  constructor(
      readonly attrName: string,
  ) { }

  resolve(resolver: Resolver<Element>): SetAttributeOutput {
    return new SetAttributeOutput(this.attrName, resolver);
  }
}

export function setAttribute(attrName: string): UnresolvedSetAttributeOutput {
  return new UnresolvedSetAttributeOutput(attrName);
}
