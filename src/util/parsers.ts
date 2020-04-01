import { integerConverter, listConverter, mapConverter, typeBased } from 'gs-tools/export/serializer';
import { enums } from 'gs-tools/export/typescript';
import { booleanType } from 'gs-types';
import { compose, Converter, human, identity, Result, Serializable } from 'nabu';

export function booleanParser(): Converter<boolean, string> {
  return compose(typeBased(booleanType), human());
}

export function enumParser<E extends string>(enumSet: any): Converter<E, string> {
  const values = new Set(enums.getAllValues(enumSet));

  return {
    convertBackward(value: string): Result<E> {
      if (values.has(value)) {
        return {success: true, result: value as E};
      }

      return {success: false};
    },

    convertForward(value: E): Result<string> {
      return {success: true, result: value};
    },
  };
}

export function integerParser(): Converter<number, string> {
  return compose(integerConverter(), human());
}

export function listParser<T>(
    itemParser: Converter<T, Serializable>,
): Converter<T[], string> {
  return compose(
      listConverter(itemParser),
      human(),
  );
}

export function mapParser<K, V>(
    keyParser: Converter<K, string>,
    valueParser: Converter<V, string>,
): Converter<ReadonlyMap<K, V>, string> {
  return compose(mapConverter(keyParser, valueParser), human());
}

export function stringParser(): Converter<string, string> {
  return identity<string>();
}
