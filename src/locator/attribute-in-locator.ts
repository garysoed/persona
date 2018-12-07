import { instanceSourceId } from 'grapevine/export/component';
import { ImmutableSet } from 'gs-tools/export/collect';
import { Errors } from 'gs-tools/src/error';
import { Type } from 'gs-types/export';
import { Converter } from 'nabu/export/main';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { mutationObservable } from '../util/mutation-observable';
import { ResolvedLocator, ResolvedWatchableLocator } from './resolved-locator';
import { UnresolvedWatchableLocator } from './unresolved-locator';

function generateVineId(elementLocator: ResolvedLocator, attrName: string): string {
  return `${elementLocator}[${attrName}]`;
}

/**
 * @internal
 */
export class ResolvedAttributeInLocator<T> extends ResolvedWatchableLocator<T> {

  constructor(
      readonly elementLocator: ResolvedWatchableLocator<Element>,
      readonly attrName: string,
      readonly parser: Converter<T, string>,
      type: Type<T>,
      private readonly defaultValue_?: T,
  ) {
    super(instanceSourceId(generateVineId(elementLocator, attrName), type));
  }

  getDependencies(): ImmutableSet<ResolvedWatchableLocator<any>> {
    return ImmutableSet
        .of<ResolvedWatchableLocator<any>>([this.elementLocator])
        .addAll(this.elementLocator.getDependencies());
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
    const parseResult = this.parser.convertBackward(unparsedValue);
    if (!parseResult.success) {
      if (this.defaultValue_ !== undefined) {
        return this.defaultValue_;
      } else {
        throw Errors.assert(`Value of ${this.attrName}`)
            .shouldBeA(this.getType())
            .butWas(unparsedValue);
      }
    }

    return parseResult.result;
  }

  toString(): string {
    return `ResolvedAttributeLocator(${this.getReadingId()})`;
  }
}

/**
 * @internal
 */
export class UnresolvedAttributeInLocator<T> extends UnresolvedWatchableLocator<T> {
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
      ResolvedAttributeInLocator<T> {
    return new ResolvedAttributeInLocator(
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

type AttributeLocator<T> = ResolvedAttributeInLocator<T> | UnresolvedAttributeInLocator<T>;

/**
 * Creates selector that selects an element.
 */
export function attributeIn<T>(
    elementLocator: UnresolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    defaultValue: T,
): UnresolvedAttributeInLocator<T>;
export function attributeIn<T>(
    elementLocator: ResolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    defaultValue: T,
): ResolvedAttributeInLocator<T>;
export function attributeIn<T>(
    elementLocator:
        ResolvedWatchableLocator<Element>|UnresolvedWatchableLocator<Element>,
    attrName: string,
    converter: Converter<T, string>,
    type: Type<T>,
    defaultValue: T,
): AttributeLocator<T> {
  if (elementLocator instanceof ResolvedLocator) {
    return new ResolvedAttributeInLocator(elementLocator, attrName, converter, type, defaultValue);
  } else {
    return new UnresolvedAttributeInLocator(
        elementLocator,
        attrName,
        converter,
        type,
        defaultValue,
    );
  }
}
