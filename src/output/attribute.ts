import {Converter} from 'nabu';
import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {UnresolvedOutput} from '../types/unresolved-output';


export class AttributeOutput<T> implements Output<T> {
  readonly type = 'out';

  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly defaultValue: T|undefined,
      readonly resolver: Resolver<HTMLElement>,
  ) { }

  output(context: ShadowContext): OperatorFunction<T, unknown> {
    return pipe(
        tap(value => {
          const el = this.resolver(context);
          try {
            const result = this.parser.convertForward(value);
            if (result.success) {
              const currentValue = el.getAttribute(this.attrName);
              if (currentValue === result.result) {
                return;
              }

              el.setAttribute(this.attrName, result.result);
            }

            if (value === this.defaultValue) {
              el.removeAttribute(this.attrName);
            }
          } catch (e) {
            // Do nothing.
          }
        }),
    );
  }
}

export class UnresolvedAttributeOutput<T> implements UnresolvedOutput<Element, T> {
  constructor(
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      readonly deleteValue: T|undefined,
  ) { }

  resolve(resolver: Resolver<HTMLElement>): AttributeOutput<T> {
    return new AttributeOutput(this.attrName, this.parser, this.deleteValue, resolver);
  }
}

export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
): UnresolvedAttributeOutput<T|undefined>;
export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    deleteValue: T,
): UnresolvedAttributeOutput<T>;
export function attribute<T>(
    attrName: string,
    parser: Converter<T, string>,
    deleteValue?: T,
): UnresolvedAttributeOutput<T> {
  return new UnresolvedAttributeOutput(attrName, parser, deleteValue);
}
