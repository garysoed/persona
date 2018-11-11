import { instanceSourceId, instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Converter } from 'gs-tools/src/converter/converter';
import { Errors } from 'gs-tools/src/error';
import { Type } from 'gs-types/export';
import { combineLatest, Observable, of as observableOf, Subscription } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { mutationObservable } from '../util/mutation-observable';
import { Handler } from '../watcher/watcher';
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
      readonly elementLocator: ResolvedWatchableLocator<Element>,
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      type: Type<T>,
      private readonly defaultValue_?: T,
      ) {
    super(
        instanceStreamId(generateVineId(elementLocator, attrName), type),
        instanceSourceId(generateVineId(elementLocator, attrName), type));
  }

  getObservableValue(root: ShadowRoot): Observable<T> {
    return this.elementLocator.getObservableValue(root)
        .pipe(
            switchMap(el => {
              return combineLatest(
                  observableOf(el),
                  mutationObservable(
                      el,
                      {
                        attributeFilter: [this.attrName],
                        attributeOldValue: true,
                        attributes: true,
                      },
                  ),
              )
              .pipe(
                  map(([el]) => {
                    return el.getAttribute(this.attrName) || '';
                  }),
                  startWith(el.getAttribute(this.attrName) || ''),
              );
            }),
            distinctUntilChanged(),
            map(unparsedValue => this.parseValue_(unparsedValue)),
            shareReplay(1),
        );
  }

  getValue(root: ShadowRoot): T {
    const element = this.elementLocator.getValue(root);

    return this.parseValue_(element.getAttribute(this.attrName) || '');
  }

  private parseValue_(unparsedValue: string): T {
    const parsedValue = this.parser.convertBackward(unparsedValue);
    if (!this.getType().check(parsedValue)) {
      if (this.defaultValue_ !== undefined) {
        return this.defaultValue_;
      } else {
        throw Errors.assert(`Value of ${this.attrName}`)
            .shouldBeA(this.getType())
            .butWas(unparsedValue);
      }
    }

    return parsedValue;
  }

  startRender(vine: VineImpl, context: BaseDisposable): Subscription {
    return combineLatest(
        vine.getObservable(this.elementLocator.getReadingId(), context),
        vine.getObservable(this.getWritingId(), context),
        )
        .subscribe(([attrEl, attr]) => {
          if (!attrEl) {
            return;
          }
          attrEl.setAttribute(this.attrName, this.parser.convertForward(attr) || '');
        });
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
      private readonly elementLocator_: UnresolvedWatchableLocator<Element>,
      private readonly attrName_: string,
      private readonly parser_: Converter<T, string>,
      private readonly type_: Type<T>,
      private readonly defaultValue_?: T,
  ) {
    super();
  }

  resolve(resolver: <S>(path: string, type: Type<S>) => S):
      ResolvedAttributeLocator<T> {
    return new ResolvedAttributeLocator(
        this.elementLocator_.resolve(resolver),
        this.attrName_,
        this.parser_,
        this.type_,
        this.defaultValue_,
    );
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
    elementLocator: UnresolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    defaultValue?: T): UnresolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator: ResolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    defaultValue?: T): ResolvedAttributeLocator<T>;
export function attribute<T>(
    elementLocator:
        ResolvedWatchableLocator<Element>|UnresolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    defaultValue?: T): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedAttributeLocator(elementLocator, attrName, converter, type, defaultValue);
  } else {
    return new UnresolvedAttributeLocator(elementLocator, attrName, converter, type, defaultValue);
  }
}
