import {array, compose, Converter, Result, success} from 'nabu';

export function listParser<T>(itemParser: Converter<string, T>): Converter<string, readonly T[]> {
  return compose(
      {
        convertBackward(value: readonly string[]): Result<string> {
          return success(value.join(' '));
        },
        convertForward(value: string): Result<readonly string[]> {
          return success(value.split(' '));
        },
      },
      array(itemParser),
  );
}