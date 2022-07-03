import {enumType} from 'gs-types';
import {Converter, failure, Result, success} from 'nabu';

interface Enum<E extends string> {
  [key: number]: E;
}

export function stringEnumParser<E extends string>(en: Enum<E>): Converter<string, E> {
  const enType = enumType<E>(en);
  return {
    convertBackward(value: E): Result<string> {
      return success(value);
    },

    convertForward(value: string): Result<E> {
      if (enType.check(value)) {
        return success(value);
      }

      return failure();
    },
  };
}