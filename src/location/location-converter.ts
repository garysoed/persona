import { Converter, Result } from 'nabu';

export type LocationConverter<T> = Converter<string, T>;

interface Spec {
  readonly [key: string]: Converter<unknown, string>;
}

type RawSpec<S extends Spec> = Record<keyof S, string>;
type TypeOf<S extends Spec> = {
  readonly [K in keyof S]: S[K] extends Converter<infer T, string> ? T : never
};

/**
 * Creates location converter from a given pattern.
 *
 * This method takes in a pattern, which is a string that looks like a path. If parts of the path
 * is of format `:name`, this method will include the value of that part of the path in the hash
 * in the returned object. For example, the matching string `/:a/_/:b` will match the hash path
 * `/hello/_/location` and returns the object `{a: 'hello', b: 'location'}`.
 *
 * @param pattern The pattern to generate the matcher.
 * @param spec Object with keys corresponding to a key in the pattern and converter for each key.
 * @return Converter for the location.
 */
export function fromPattern<S extends Spec>(
    pattern: string,
    spec: S,
): LocationConverter<TypeOf<S>> {
  return {
    convertBackward(value: TypeOf<S>): Result<string> {
      let result = pattern;
      for (const key of Object.keys(value)) {
        result = result.replace(new RegExp(`:${key}\\??`), `${value[key]}`);
      }

      return {success: true, result};
    },

    convertForward(value: string): Result<TypeOf<S>> {
      const replacedSpec = pattern.replace(
          /:([^/?]+)(\??)/g,
          (_, key, optional) => {
            const match = optional ? '*' : '+';

            return `(?<${key}>[^/]${match})`;
          });
      const regex = new RegExp(`^${replacedSpec}$`);
      const match = value.match(regex);
      if (!match) {
        return {success: false};
      }

      const rawSpec: RawSpec<S> = (match as any)['groups'] || {};
      const outValue: Partial<TypeOf<S>> = {};
      for (const key of Object.keys(rawSpec) as Array<keyof RawSpec<S>>) {
        const rawStr = rawSpec[key];
        const result = spec[key].convertBackward(rawStr);
        if (!result.success) {
          return {success: false};
        }

        outValue[key] = result.result as any;
      }

      return {success: true, result: outValue as TypeOf<S>};
    },
  };
}
