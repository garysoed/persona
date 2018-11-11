import { InstanceSourceId, instanceSourceId } from 'grapevine/export/component';
import { cache } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType, Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { elementObservable } from '../util/element-observable';
import { ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * @internal
 */
export class ResolvedElementLocator<T extends HTMLElement>
    extends ResolvedWatchableLocator<T> {
  constructor(
      private readonly selectorString_: string,
      sourceId: InstanceSourceId<T>) {
    super(sourceId);
  }

  @cache()
  getObservableValue(root: ShadowRoot): Observable<T> {
    return elementObservable<T>(root, root => this.getValue(root));
  }

  getSelectorString(): string {
    return this.selectorString_;
  }

  getValue(root: ShadowRoot): T {
    const selectorString = this.selectorString_;
    const type = this.getType();
    const el = root.querySelector(selectorString);
    if (!type.check(el)) {
      throw Errors.assert(`Element of [${selectorString}]`).shouldBeA(type).butWas(el);
    }

    return el;
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.getReadingId()})`;
  }
}

/**
 * @internal
 */
export class UnresolvedElementLocator<T extends HTMLElement>
    extends UnresolvedWatchableLocator<T> {
  constructor(private readonly path_: string) {
    super();
  }

  getPath(): string {
    return this.path_;
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedElementLocator<T> {
    return resolver(this.path_, InstanceofType<ResolvedElementLocator<T>>(ResolvedElementLocator));
  }

  toString(): string {
    return `UnresolvedAttributeLocator(${this.path_})`;
  }
}

export type ElementLocator<T extends HTMLElement> =
    ResolvedElementLocator<T> | UnresolvedElementLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function element<T extends HTMLElement>(
    selector: string): UnresolvedElementLocator<T>;
export function element<T extends HTMLElement>(cssSelector: string, type: Type<T>):
    ResolvedElementLocator<T>;
export function element<T extends HTMLElement>(
    selector: string, type?: Type<T>): ElementLocator<T> {
  if (type) {
    return new ResolvedElementLocator(selector, instanceSourceId(selector, type));
  } else {
    return new UnresolvedElementLocator(selector);
  }
}
