import {Converter, Result} from 'nabu';

export function integer(radix?: number): Converter<number|null, string|null> {
  return {
    convertBackward(value: string|null): Result<number|null> {
      if (value === null) {
        return {result: null, success: true};
      }

      const result = Number.parseInt(value, radix);
      if (Number.isNaN(result)) {
        return {success: false};
      }

      return {result, success: true};
    },

    convertForward(input: number): Result<string|null> {
      return {result: `${input}`, success: true};
    },
  };
}