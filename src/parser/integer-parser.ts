import {Converter, Result} from 'nabu';

export function integerParser(radix?: number): Converter<number, string> {
  return {
    convertBackward(value: string): Result<number> {
      const result = Number.parseInt(value, radix);
      if (Number.isNaN(result)) {
        return {success: false};
      }

      return {result, success: true};
    },

    convertForward(input: number): Result<string> {
      return {result: `${input}`, success: true};
    },
  };
}