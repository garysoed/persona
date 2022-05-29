import {Converter, identity} from 'nabu';
import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiType, IOType, OAttr} from '../types/io';


class ResolvedOAttr<T> implements OAttr<T> {
  readonly apiType = ApiType.ATTR;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly attrName: string,
      readonly converter: Converter<T|null, string|null>,
  ) {}

  resolve(target: Element): () => OperatorFunction<T|null, T|null> {
    return () => pipe(
        tap(newValue => {
          if (newValue === null) {
            target.removeAttribute(this.attrName);
            return;
          }

          const result = this.converter.convertForward(newValue);
          if (!result.success || result.result === null) {
            target.removeAttribute(this.attrName);
          } else {
            target.setAttribute(this.attrName, result.result);
          }
        }),
    );
  }
}

export function oattr(attrName: string): ResolvedOAttr<string>;
export function oattr<T>(attrName: string, converter: Converter<T|null, string|null>): ResolvedOAttr<T>;
export function oattr<T>(attrName: string, converter?: Converter<T|null, string|null>): ResolvedOAttr<any> {
  if (converter) {
    return new ResolvedOAttr(attrName, converter);
  }
  return new ResolvedOAttr(attrName, identity());
}
