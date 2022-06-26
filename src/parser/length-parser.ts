import {Converter, firstSuccess, Result} from 'nabu';

import {numberParser} from './number-parser';

export type Length = number|
    `${number}cap`|
    `${number}ch`|
    `${number}em`|
    `${number}ex`|
    `${number}ic`|
    `${number}lh`|
    `${number}rem`|
    `${number}rlh`;

function lengthWithSuffix<S extends string>(suffix: S): Converter<`${number}${S}`, string> {
  return {
    convertBackward(value: string): Result<`${number}${S}`> {
      if (!value.endsWith(suffix)) {
        return {success: false};
      }

      const numberSegment = value.substring(0, value.length - suffix.length);
      const result = numberParser().convertBackward(numberSegment);
      if (result.success) {
        return {success: true, result: value as `${number}${S}`};
      }

      return {success: false};
    },

    convertForward(value: `${number}${S}`): Result<string> {
      return {success: true, result: value};
    },
  };
}

const INSTANCE = firstSuccess<Length, string>(
    numberParser(),
    lengthWithSuffix('cap'),
    lengthWithSuffix('ch'),
    lengthWithSuffix('em'),
    lengthWithSuffix('ex'),
    lengthWithSuffix('ic'),
    lengthWithSuffix('lh'),
    lengthWithSuffix('rem'),
    lengthWithSuffix('rlh'),
);

export function lengthParser(): Converter<Length, string> {
  return INSTANCE;
}