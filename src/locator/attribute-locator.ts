import { instanceSourceId, instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Parser } from 'gs-tools/export/parse';
import { Type } from 'gs-types/export';
import { ChainedWatcher, Unlisten } from '../watcher/chained-watcher';
import { Handler, Watcher } from '../watcher/watcher';
import { ResolvedLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedRenderableWatchableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

/**
 * A subclass of MutationRecord.
 */
interface Record {
  attributeName: string|null;
  oldValue: string|null;
  target: Node;
}

function generateVineId(elementLocator: ResolvedLocator, attrName: string):
    string {
  return `${elementLocator}[${attrName}]`;
}

export function onMutation_(root: ShadowRoot, records: Record[], onChange: Handler): void {
  for (const {attributeName, oldValue, target} of records) {
    if (!attributeName) {
      continue;
    }

    if (!(target instanceof Element)) {
      continue;
    }

    const oldValueString = oldValue;
    const unparsedValue = target.getAttribute(attributeName);

    if (oldValueString === unparsedValue) {
      continue;
    }

    onChange(root);
  }
}

/**
 * @internal
 */
export class ResolvedAttributeLocator<T>
    extends ResolvedRenderableWatchableLocator<T> {

  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
      private readonly attrName_: string,
      private readonly defaultValue_: T,
      private readonly parser_: Parser<T>,
      type: Type<T>) {
    super(
        instanceStreamId(generateVineId(elementLocator_, attrName_), type),
        instanceSourceId(generateVineId(elementLocator_, attrName_), type));
  }

  createWatcher(): Watcher<T> {
    return new ChainedWatcher<HTMLElement|null, T>(
        this.elementLocator_.createWatcher(),
        (
            element: HTMLElement|null,
            prevUnlisten: Unlisten|null,
            _: VineImpl,
            onChange: Handler,
            root: ShadowRoot) => {
              if (!element) {
                return null;
              }

              return this.startWatch_(root, element, prevUnlisten, onChange);
            },
        source => {
          const value = this.getAttributeValue_(source);
          if (value === null) {
            return this.defaultValue_;
          }

          return value;
        });
  }

  private getAttributeValue_(element: HTMLElement|null): T|null {
    if (!element) {
      return null;
    }

    return this.parser_.convertFrom(element.getAttribute(this.attrName_));
  }

  getValue(root: ShadowRoot): T {
    const element = this.elementLocator_.getValue(root);
    const value = this.getAttributeValue_(element);
    const type = this.getType();
    if (!type.check(value)) {
      return this.defaultValue_;
    }

    return value;
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((attrEl, attr) => {
      if (!attrEl) {
        return;
      }
      attrEl.setAttribute(this.attrName_, this.parser_.convertTo(attr) || '');
    }, context, this.elementLocator_.getReadingId(), this.getWritingId());
  }

  private startWatch_(
      root: ShadowRoot,
      element: HTMLElement,
      prevUnlisten: Unlisten|null,
      onChange: Handler): Unlisten|null {
    // Check if already listening. If so, bail out.
    if (prevUnlisten && prevUnlisten.key === element) {
      return prevUnlisten;
    }

    if (prevUnlisten) {
      prevUnlisten.unlisten.dispose();
    }

    // If there is no element, bail out quickly.
    if (!(element instanceof HTMLElement)) {
      onChange(root);

      return null;
    }

    const mutationObserver =
        new MutationObserver(records => onMutation_(root, records, onChange));
    mutationObserver.observe(
        element,
        {attributeFilter: [this.attrName_], attributes: true, attributeOldValue: true});
    onMutation_(
        root,
        [{attributeName: this.attrName_, oldValue: null, target: element}],
        onChange);

    return {
      key: element,
      unlisten: DisposableFunction.of(() => {
        mutationObserver.disconnect();
      }),
    };
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.getReadingId()})`;
  }
}

/**
 * @internal
 */
export class UnresolvedAttributeLocator<T>
    extends UnresolvedRenderableWatchableLocator<T> {
  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLElement|null>,
      private readonly attrName_: string,
      private readonly defaultValue_: T,
      private readonly parser_: Parser<T>,
      private readonly type_: Type<T>) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S):
      ResolvedAttributeLocator<T> {
    return new ResolvedAttributeLocator(
        this.elementLocator_.resolve(resolver),
        this.attrName_,
        this.defaultValue_,
        this.parser_,
        this.type_);
  }

  toString(): string {
    return `UnresolvedAttributeLocator(${this.elementLocator_}[${this.attrName_}])`;
  }
}

type AttributeLocator<T> = ResolvedAttributeLocator<T> | UnresolvedAttributeLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function attribute<T>(
    elementLocator: ResolvedWatchableLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>,
    defaultValue: T): ResolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: UnresolvedWatchableLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>,
    defaultValue: T): UnresolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator:
        ResolvedWatchableLocator<HTMLElement|null>|UnresolvedWatchableLocator<HTMLElement|null>,
    attrName: string,
    parser: Parser<T>,
    type: Type<T>,
    defaultValue: T): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedAttributeLocator(elementLocator, attrName, defaultValue, parser, type);
  } else {
    return new UnresolvedAttributeLocator(elementLocator, attrName, defaultValue, parser, type);
  }
}
