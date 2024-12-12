import {Type} from 'gs-types';
import {Converter} from 'nabu';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderSpec} from '../../export';
import {RenderContext} from '../render/types/render-context';

import {KeyMatchOptions} from './key-match-options';
import {Target} from './target';

export enum IOType {
  INPUT,
  OUTPUT,
}

export enum ApiType {
  ATTR,
  CALL,
  CASE,
  CLASS,
  EVENT,
  FLAG,
  FOREACH,
  KEYDOWN,
  MEDIA,
  PROPERTY,
  RECT,
  SLOTTED,
  STYLE,
  TARGET,
  TEXT,
  VALUE,
}

export type RenderValueFn<T> = OperatorFunction<T, RenderSpec | null>;

export interface ReferenceI<V, T> {
  readonly ioType: IOType.INPUT;
  resolve: (target: T, context: RenderContext) => Observable<V>;
}

export interface ReferenceO<V, U, A extends readonly unknown[], T> {
  readonly ioType: IOType.OUTPUT;
  resolve: (
    target: T,
    context: RenderContext,
  ) => (...args: A) => OperatorFunction<V, U>;
}

export interface IAttr<T> extends ReferenceI<T | null, Element> {
  readonly apiType: ApiType.ATTR;
  readonly attrName: string;
  readonly converter: Converter<string, T>;
  readonly ioType: IOType.INPUT;
}

export interface OAttr<T> extends ReferenceO<T | null, T | null, [], Element> {
  readonly apiType: ApiType.ATTR;
  readonly attrName: string;
  readonly converter: Converter<T, string>;
  readonly ioType: IOType.OUTPUT;
}

export type TypeOfArray<T extends readonly unknown[]> = {
  readonly [K in keyof T]: Type<T[K]>;
};

export interface ICall<A extends readonly unknown[], M extends string>
  extends ReferenceI<A, Element> {
  readonly apiType: ApiType.CALL;
  readonly argTypes: TypeOfArray<A>;
  readonly ioType: IOType.INPUT;
  readonly methodName: M;
}

export interface OCall<A extends readonly unknown[], M extends string>
  extends ReferenceO<A, A, [], Element> {
  readonly apiType: ApiType.CALL;
  readonly argTypes: TypeOfArray<A>;
  readonly ioType: IOType.OUTPUT;
  readonly methodName: M;
}

export interface OCase<T> extends ReferenceO<T, T, [RenderValueFn<T>], Target> {
  readonly apiType: ApiType.CASE;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string | null;
}

export interface IClass extends ReferenceI<boolean, Element> {
  readonly apiType: ApiType.CLASS;
  readonly className: string;
  readonly ioType: IOType.INPUT;
}

export interface OClass extends ReferenceO<boolean, boolean, [], Element> {
  readonly apiType: ApiType.CLASS;
  readonly className: string;
  readonly ioType: IOType.OUTPUT;
}

export interface EventCtor<E extends Event> {
  new (...args: readonly any[]): E;
}

export interface IEvent<E extends Event> extends ReferenceI<E, Element> {
  readonly apiType: ApiType.EVENT;
  readonly eventName: string;
  readonly eventType: EventCtor<E>;
  readonly ioType: IOType.INPUT;
}

export interface OEvent<E extends Event> extends ReferenceO<E, E, [], Element> {
  readonly apiType: ApiType.EVENT;
  readonly eventName: string;
  readonly eventType: EventCtor<E>;
  readonly ioType: IOType.OUTPUT;
}

export interface IFlag extends ReferenceI<boolean, Element> {
  readonly apiType: ApiType.FLAG;
  readonly attrName: string;
  readonly ioType: IOType.INPUT;
}

export interface OFlag extends ReferenceO<boolean, boolean, [], Element> {
  readonly apiType: ApiType.FLAG;
  readonly attrName: string;
  readonly ioType: IOType.OUTPUT;
}

export interface OForeach<T>
  extends ReferenceO<readonly T[], readonly T[], [RenderValueFn<T>], Target> {
  readonly apiType: ApiType.FOREACH;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string | null;
}

export interface OForeachConfig<T> {
  readonly getId?: (value: T) => unknown;
  readonly render?: RenderValueFn<T>;
}

export interface IKeydown extends ReferenceI<KeyboardEvent, Element> {
  readonly apiType: ApiType.KEYDOWN;
  readonly ioType: IOType.INPUT;
  readonly key: string;
  readonly matchOptions: KeyMatchOptions;
}

export interface IMedia extends ReferenceI<boolean, Target> {
  readonly apiType: ApiType.MEDIA;
  readonly ioType: IOType.INPUT;
  readonly query: string;
}

export interface OProperty
  extends ReferenceO<string | null, string | null, [], HTMLElement> {
  readonly apiType: ApiType.PROPERTY;
  readonly ioType: IOType.OUTPUT;
  readonly propertyName: string;
}

export interface IRect extends ReferenceI<DOMRect, Element> {
  readonly apiType: ApiType.RECT;
  readonly ioType: IOType.INPUT;
}

export interface ISlotted extends ReferenceI<readonly Node[], Element> {
  readonly apiType: ApiType.SLOTTED;
  readonly ioType: IOType.INPUT;
}

export interface OSlotted
  extends ReferenceO<readonly Node[], readonly Node[], [], Element> {
  readonly apiType: ApiType.SLOTTED;
  readonly ioType: IOType.OUTPUT;
}

export interface OStyle<S extends keyof CSSStyleDeclaration>
  extends ReferenceO<string, string, [], Target & ElementCSSInlineStyle> {
  readonly apiType: ApiType.STYLE;
  readonly ioType: IOType.OUTPUT;
  readonly propertyName: S;
}

export interface ITarget extends ReferenceI<Element, Element> {
  readonly apiType: ApiType.TARGET;
  readonly ioType: IOType.INPUT;
}

export interface IText extends ReferenceI<string, Element> {
  readonly apiType: ApiType.TEXT;
  readonly ioType: IOType.INPUT;
}

export interface OText extends ReferenceO<string, string, [], Target> {
  readonly apiType: ApiType.TEXT;
  readonly ioType: IOType.OUTPUT;
}

export interface IValue<T, P extends string> extends ReferenceI<T, Element> {
  readonly apiType: ApiType.VALUE;
  readonly defaultValueProvider: () => T;
  readonly ioType: IOType.INPUT;
  readonly key: P;
  readonly valueType: Type<T>;
}

export interface OValue<T, P extends string>
  extends ReferenceO<T, T, [], Element> {
  readonly apiType: ApiType.VALUE;
  readonly defaultValueProvider: () => T;
  readonly ioType: IOType.OUTPUT;
  readonly key: P;
  readonly valueType: Type<T>;
}

export type Resolver = (host: HTMLElement) => HTMLElement;

// TODO: Only used in reverse spec?
export type InputOutput =
  | IAttr<any>
  | OAttr<any>
  | ICall<any, string>
  | OCall<any, string>
  | OCase<any>
  | IClass
  | OClass
  | IEvent<any>
  | OEvent<any>
  | IFlag
  | OFlag
  | OForeach<any>
  | IKeydown
  | IMedia
  | OProperty
  | IRect
  | ISlotted
  | OSlotted
  | OStyle<keyof CSSStyleDeclaration>
  | ITarget
  | IText
  | OText
  | IValue<any, string>
  | OValue<any, string>;

export type InputOutputThatResolvesWith<T> =
  | (InputOutput & ReferenceI<any, T>)
  | (InputOutput & ReferenceO<any, any, any, T>);
