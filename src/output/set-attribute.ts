import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';
import {UnresolvedOutput} from '../types/unresolved-output';


export class SetAttributeOutput implements Output<boolean> {
  constructor(
      readonly attrName: string,
      readonly resolver: Resolver<Element>,
  ) { }

  output(context: PersonaContext): OperatorFunction<boolean, unknown> {
    return pipe(
        tap(value => {
          const el = this.resolver(context);
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
    UnresolvedElementProperty<Element, SetAttributeOutput>, UnresolvedOutput<boolean> {
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
