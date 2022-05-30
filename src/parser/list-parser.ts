import {array, compose, Converter, Result, success} from 'nabu';

export function listParser<T>(itemParser: Converter<T, string>): Converter<readonly T[], string> {
  return compose(
      array(itemParser),
      {
        convertBackward(value: string): Result<readonly string[]> {
          return success(value.split(' '));
        },
        convertForward(value: readonly string[]): Result<string> {
          return success(value.join(' '));
        },
      },
  );
}