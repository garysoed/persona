import {Converter, failure, Result, success} from 'nabu';

export function integerParser(radix?: number): Converter<string, number> {
  return {
    convertBackward(input: number): Result<string> {
      return success(`${input}`);
    },

    convertForward(value: string): Result<number> {
      const result = Number.parseInt(value, radix);
      if (Number.isNaN(result)) {
        return failure();
      }

      return success(result);
    },
  };
}