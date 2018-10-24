import { Jsons } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/export/error';
import { Type } from 'gs-types/export';
import { ResolvedAttributeLocator, UnresolvedAttributeLocator } from './attribute-locator';
import { ResolvedClassListLocator, UnresolvedClassListLocator } from './classlist-locator';
import { ResolvedDispatcherLocator, UnresolvedDispatcherLocator } from './dispatcher-locator';
import { ResolvedElementLocator, UnresolvedElementLocator } from './element-locator';
import { ResolvedLocator } from './resolved-locator';
import { ResolvedSlotLocator, UnresolvedSlotLocator } from './slot-locator';
import { ResolvedStyleLocator, UnresolvedStyleLocator } from './style-locator';
import { ResolvedTextContentLocator, UnresolvedTextContentLocator } from './text-content-locator';
import { UnresolvedLocator } from './unresolved-locator';

/**
 * Object that recursively contains locator spec, resolved or unresolved.
 */
interface LocatorObject {
  [key: string]: ResolvedLocator|UnresolvedLocator|LocatorObject;
}

// tslint:disable:semicolon whitespace typedef no-empty no-unused-expression
type Resolved<T extends ResolvedLocator|UnresolvedLocator|LocatorObject> =
    T extends UnresolvedAttributeLocator<infer V> ? ResolvedAttributeLocator<V> :
    T extends UnresolvedClassListLocator ? ResolvedClassListLocator :
    T extends UnresolvedDispatcherLocator<infer V> ? ResolvedDispatcherLocator<V> :
    T extends UnresolvedElementLocator<infer E> ? ResolvedElementLocator<E> :
    T extends UnresolvedSlotLocator<infer E, infer N> ? ResolvedSlotLocator<E, N> :
    T extends UnresolvedStyleLocator<infer S> ? ResolvedStyleLocator<S> :
    T extends UnresolvedTextContentLocator ? ResolvedTextContentLocator :
    T extends ResolvedLocator ? T :
    T extends LocatorObject ? ResolvedLocatorObject<T> : never;

type ResolvedLocatorObject<O extends LocatorObject> = {
  [K in keyof O]: Resolved<O[K]>;
};

function resolveSelectorsHelper_<T extends LocatorObject>(
    current: T, root: LocatorObject): ResolvedLocatorObject<T>;
function resolveSelectorsHelper_<T>(
    current: ResolvedLocator|UnresolvedLocator, root: LocatorObject): ResolvedLocator;
function resolveSelectorsHelper_(
    current: ResolvedLocator|UnresolvedLocator|LocatorObject,
    root: LocatorObject): ResolvedLocator|ResolvedLocatorObject<any> {
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

export function resolveLocators<T extends LocatorObject>(raw: T): ResolvedLocatorObject<T> {
  return resolveSelectorsHelper_<T>(raw, raw);
}

