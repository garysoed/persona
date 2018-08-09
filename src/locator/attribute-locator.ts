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
  attributeName: string | null;
  target: Node;
}

function generateVineId(elementLocator: ResolvedLocator, attrName: string):
    string {
  return `${elementLocator}[${attrName}]`;
}

/**
 * @internal
 */
export class ResolvedAttributeLocator<T> extends ResolvedRenderableWatchableLocator<T> {

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
            onChange: Handler<T>) => this.startWatch_(element, prevUnlisten, onChange));
  }

  getValue(root: ShadowRoot): T {
    const element = this.elementLocator_.getValue(root);
    let attrValue = null;
    if (element) {
      attrValue = element.getAttribute(this.attrName_);
    }

    const value = this.parser_.parse(attrValue);
    const type = this.getType();
    if (!type.check(value)) {
      return this.defaultValue_;
    }

    return value;
  }

  private onMutation_(records: Record[], onChange: Handler<T>): void {
    for (const {attributeName, target} of records) {
      if (!attributeName) {
        continue;
      }

      if (!(target instanceof Element)) {
        continue;
      }

      const unparsedValue = target.getAttribute(attributeName);
      const parsedValue = this.parser_.parse(unparsedValue);
      if (this.getType().check(parsedValue)) {
        onChange(parsedValue);
      } else {
        onChange(this.defaultValue_);
      }
    }
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((attrEl, attr) => {
      if (!attrEl) {
        return;
      }
      attrEl.setAttribute(this.attrName_, this.parser_.stringify(attr));
    }, context, this.elementLocator_.getReadingId(), this.getWritingId());
  }

  private startWatch_(
      element: HTMLElement|null,
      prevUnlisten: Unlisten|null,
      onChange: Handler<T>): Unlisten|null {
    // Check if already listening. If so, bail out.
    if (prevUnlisten && prevUnlisten.key === element) {
      return prevUnlisten;
    }

    if (prevUnlisten) {
      prevUnlisten.unlisten.dispose();
    }

    // If there is no element, bail out quickly.
    if (!element) {
      onChange(this.defaultValue_);

      return null;
    }

    const mutationObserver = new MutationObserver(records => this.onMutation_(records, onChange));
    mutationObserver.observe(element, {attributeFilter: [this.attrName_], attributes: true});
    this.onMutation_([{attributeName: this.attrName_, target: element}], onChange);

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

  resolve(resolver: <S>(path: string, type: Type<S>) => S): ResolvedAttributeLocator<T> {
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
