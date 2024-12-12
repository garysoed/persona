import {Converter, failure, Result, success} from 'nabu';

const INSTANCE: Converter<string, number> = {
  convertBackward(input: number): Result<string> {
    return success(`${input}`);
  },

  convertForward(value: string): Result<number> {
    const result = Number.parseFloat(value);
    if (Number.isNaN(result) || `${result}` !== value) {
      return failure();
    }

    return success(result);
  },
};

export function numberParser(): Converter<string, number> {
  return INSTANCE;
}
