import {Converter, Result} from 'nabu';

const INSTANCE: Converter<number, string> = {
  convertBackward(value: string): Result<number> {
    const result = Number.parseFloat(value);
    if (Number.isNaN(result) || `${result}` !== value) {
      return {success: false};
    }

    return {result, success: true};
  },

  convertForward(input: number): Result<string> {
    return {result: `${input}`, success: true};
  },
};

export function numberParser(): Converter<number, string> {
  return INSTANCE;
}