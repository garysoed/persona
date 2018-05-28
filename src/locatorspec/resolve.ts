import { Jsons } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/export/error';
import { Type } from 'gs-types/export';
import { ResolvedElementSpec, UnresolvedElementSpec } from './element-spec';
import { ResolvedSpec, UnresolvedSpec } from './spec';

/**
 * Object that recursively contains locator spec, resolved or unresolved.
 */
interface SpecObject {
  [key: string]: ResolvedSpec<any> | UnresolvedSpec<any> | SpecObject;
}

// tslint:disable:semicolon whitespace typedef no-empty no-unused-expression
type Resolved<T extends ResolvedSpec<any> | UnresolvedSpec<any> | SpecObject> =
    T extends UnresolvedElementSpec<infer E> ? ResolvedElementSpec<E> :
    T extends ResolvedSpec<any> ? T :
    T extends SpecObject ? ResolvedSpecObject<T> : never;
// tslint:enable

type ResolvedSpecObject<O extends SpecObject> = {
  [K in keyof O]: Resolved<O[K]>;
};

function resolveSelectorsHelper_<T>(
    current: ResolvedSpec<T> | UnresolvedSpec<T>, root: SpecObject): ResolvedSpec<T>;
function resolveSelectorsHelper_<T extends SpecObject>(
    current: T, root: SpecObject): ResolvedSpecObject<T>;
function resolveSelectorsHelper_(
    current: ResolvedSpec<any> | UnresolvedSpec<any> | SpecObject,
    root: SpecObject): ResolvedSpec<any> | ResolvedSpecObject<any> {
  if (current instanceof ResolvedSpec) {
    return current;
  }

  if (current instanceof UnresolvedSpec) {
    const resolver = (path: string, type: Type<any>) => {
      const resolvedValue = Jsons.getValue(root, path);
      if (!type.check(resolvedValue)) {
        throw Errors.assert(`Type of ${path}`).shouldBeA(type).butWas(resolvedValue);
      }

      return resolvedValue;
    };

    return current.resolve(resolver);
  }

  // tslint:disable-next-line:no-object-literal-type-assertion
  const processed: ResolvedSpecObject<any> = {} as Resolved<any>;
  for (const key in current) {
    if (!current.hasOwnProperty(key)) {
      continue;
    }

    const value = current[key];
    processed[key] = value instanceof ResolvedSpec || value instanceof UnresolvedSpec ?
        resolveSelectorsHelper_(value, root) :
        resolveSelectorsHelper_(value, root);
  }

  return processed;
}

export function resolveSelectors<T extends SpecObject>(raw: T): ResolvedSpecObject<T> {
  return resolveSelectorsHelper_<T>(raw, raw);
}

