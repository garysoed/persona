import { Jsons } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/export/error';
import { Type } from 'gs-types/export';
import { ResolvedElementLocator, UnresolvedElementLocator } from './element-locator';
import { ResolvedLocator, UnresolvedLocator } from './locator';

/**
 * Object that recursively contains locator spec, resolved or unresolved.
 */
interface LocatorObject {
  [key: string]: ResolvedLocator<any> | UnresolvedLocator<any> | LocatorObject;
}

// tslint:disable:semicolon whitespace typedef no-empty no-unused-expression
type Resolved<T extends ResolvedLocator<any> | UnresolvedLocator<any> | LocatorObject> =
    T extends UnresolvedElementLocator<infer E> ? ResolvedElementLocator<E> :
    T extends ResolvedLocator<any> ? T :
    T extends LocatorObject ? ResolvedLocatorObject<T> : never;
// tslint:enable

type ResolvedLocatorObject<O extends LocatorObject> = {
  [K in keyof O]: Resolved<O[K]>;
};

function resolveSelectorsHelper_<T>(
    current: ResolvedLocator<T> | UnresolvedLocator<T>, root: LocatorObject): ResolvedLocator<T>;
function resolveSelectorsHelper_<T extends LocatorObject>(
    current: T, root: LocatorObject): ResolvedLocatorObject<T>;
function resolveSelectorsHelper_(
    current: ResolvedLocator<any> | UnresolvedLocator<any> | LocatorObject,
    root: LocatorObject): ResolvedLocator<any> | ResolvedLocatorObject<any> {
  if (current instanceof ResolvedLocator) {
    return current;
  }

  if (current instanceof UnresolvedLocator) {
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
  const processed: ResolvedLocatorObject<any> = {} as Resolved<any>;
  for (const key in current) {
    if (!current.hasOwnProperty(key)) {
      continue;
    }

    const value = current[key];
    processed[key] = value instanceof ResolvedLocator || value instanceof UnresolvedLocator ?
        resolveSelectorsHelper_(value, root) :
        resolveSelectorsHelper_(value, root);
  }

  return processed;
}

export function resolveSelectors<T extends LocatorObject>(raw: T): ResolvedLocatorObject<T> {
  return resolveSelectorsHelper_<T>(raw, raw);
}

