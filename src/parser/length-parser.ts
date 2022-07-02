import {Converter, failure, firstSuccess, Result, success} from 'nabu';

import {numberParser} from './number-parser';

export type Length = number|
    `${number}em`|
    `${number}ex`|
    `${number}ch`|
    `${number}rem`|
    `${number}vw`|
    `${number}vh`|
    `${number}vmin`|
    `${number}vmax`|
    `${number}cm`|
    `${number}mm`|
    `${number}Q`|
    `${number}in`|
    `${number}pc`|
    `${number}pt`|
    `${number}px`|
    `${number}%`;

function lengthWithSuffix<S extends string>(suffix: S): Converter<`${number}${S}`, string> {
  return {
    convertBackward(value: string): Result<`${number}${S}`> {
      if (!value.endsWith(suffix)) {
        return failure();
      }

      const numberSegment = value.substring(0, value.length - suffix.length);
      const result = numberParser().convertBackward(numberSegment);
      if (result.success) {
        return success(value as `${number}${S}`);
      }

      return failure();
    },

    convertForward(value: `${number}${S}`): Result<string> {
      return success(value);
    },
  };
}

const INSTANCE = firstSuccess<Length, string>(
    numberParser(),
    lengthWithSuffix('em'),
    lengthWithSuffix('ex'),
    lengthWithSuffix('ch'),
    lengthWithSuffix('rem'),
    lengthWithSuffix('vw'),
    lengthWithSuffix('vh'),
    lengthWithSuffix('vmin'),
    lengthWithSuffix('vmax'),
    lengthWithSuffix('cm'),
    lengthWithSuffix('mm'),
    lengthWithSuffix('Q'),
    lengthWithSuffix('in'),
    lengthWithSuffix('pc'),
    lengthWithSuffix('pt'),
    lengthWithSuffix('px'),
    lengthWithSuffix('%'),
);

export function lengthParser(): Converter<Length, string> {
  return INSTANCE;
}