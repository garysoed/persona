import {Type} from 'gs-types';
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
  RECT,
  SLOTTED,
  STYLE,
  TARGET,
  TEXT,
  VALUE,
}

export type RenderValueFn<T> = (value: T) => Observable<RenderSpec|null>;
export type RenderValuesFn<T> = (value: T, index: number) => Observable<RenderSpec|null>;

export interface ReferenceI<V, T> {
  readonly ioType: IOType.INPUT;
  resolve: (target: T, context: RenderContext) => Observable<V>;
}

export interface ReferenceO<V, U, A extends readonly unknown[], T> {
  resolve: (target: T, context: RenderContext) => ((...args: A) => OperatorFunction<V, U>);
  readonly ioType: IOType.OUTPUT;
}

export interface IAttr extends ReferenceI<string|null, Element> {
  readonly apiType: ApiType.ATTR;
  readonly ioType: IOType.INPUT;
  readonly attrName: string;
}

export interface OAttr extends ReferenceO<string|null, string|null, [], Element> {
  readonly apiType: ApiType.ATTR;
  readonly ioType: IOType.OUTPUT;
  readonly attrName: string;
}

export interface ICall<T, M extends string> extends ReferenceI<T, Element> {
  readonly apiType: ApiType.CALL;
  readonly ioType: IOType.INPUT;
  readonly methodName: M;
  readonly argType: Type<T>;
}

export interface OCall<T, M extends string> extends ReferenceO<T, T, [], Element> {
  readonly apiType: ApiType.CALL;
  readonly ioType: IOType.OUTPUT;
  readonly methodName: M;
  readonly argType: Type<T>;
}

export interface OCase<T> extends ReferenceO<T, T, [RenderValueFn<T>], Target> {
  readonly apiType: ApiType.CASE;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string|null;
  readonly valueType: Type<T>;
}

export interface IClass extends ReferenceI<boolean, Element> {
  readonly apiType: ApiType.CLASS;
  readonly ioType: IOType.INPUT;
  readonly className: string;
}

export interface OClass extends ReferenceO<boolean, boolean, [], Element> {
  readonly apiType: ApiType.CLASS;
  readonly ioType: IOType.OUTPUT;
  readonly className: string;
}

export interface EventCtor<E extends Event> {
  new (...args: readonly any[]): E;
}

export interface IEvent<E extends Event> extends ReferenceI<E, Element> {
  readonly apiType: ApiType.EVENT;
  readonly ioType: IOType.INPUT;
  readonly eventName: string;
  readonly eventType: EventCtor<E>;
}

export interface OEvent<E extends Event> extends ReferenceO<E, E, [], Element> {
  readonly apiType: ApiType.EVENT;
  readonly ioType: IOType.OUTPUT;
  readonly eventName: string;
  readonly eventType: EventCtor<E>;
}

export interface IFlag extends ReferenceI<boolean, Element> {
  readonly apiType: ApiType.FLAG;
  readonly ioType: IOType.INPUT;
  readonly attrName: string;
}

export interface OFlag extends ReferenceO<boolean, boolean, [], Element> {
  readonly apiType: ApiType.FLAG;
  readonly ioType: IOType.OUTPUT;
  readonly attrName: string;
}

export interface OForeach<T> extends ReferenceO<readonly T[], readonly T[], [RenderValuesFn<T>], Target> {
  readonly apiType: ApiType.FOREACH;
  readonly ioType: IOType.OUTPUT;
  readonly slotName: string;
  readonly valueType: Type<T>;
}

export interface OForeachConfig<T> {
  readonly render?: RenderValuesFn<T>;
  readonly getId?: (value: T) => unknown;
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

export interface IRect extends ReferenceI<DOMRect, Element> {
  readonly apiType: ApiType.RECT;
  readonly ioType: IOType.INPUT;
}

export interface ISlotted extends ReferenceI<readonly Node[], Element> {
  readonly apiType: ApiType.SLOTTED;
  readonly ioType: IOType.INPUT;
}

export interface OSlotted extends ReferenceO<readonly Node[], readonly Node[], [], Element> {
  readonly apiType: ApiType.SLOTTED;
  readonly ioType: IOType.OUTPUT;
}

export interface OStyle<S extends keyof CSSStyleDeclaration> extends ReferenceO<string, string, [], HTMLElement> {
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
  readonly ioType: IOType.INPUT;
  readonly defaultValue: T;
  readonly key: P;
  readonly valueType: Type<T>;
}

export interface OValue<T, P extends string> extends ReferenceO<T, T, [], Element> {
  readonly apiType: ApiType.VALUE;
  readonly ioType: IOType.OUTPUT;
  readonly valueType: Type<T>;
  readonly key: P;
  readonly defaultValue: T;
}

export type Resolver = (host: HTMLElement) => HTMLElement;

// TODO: Only used in reverse spec?
export type InputOutput =
    IAttr|OAttr|
    ICall<any, string>|OCall<any, string>|
    OCase<any>|
    IClass|OClass|
    IEvent<any>|OEvent<any>|
    IFlag|OFlag|
    OForeach<any>|
    IKeydown|
    IMedia|
    IRect|
    ISlotted|OSlotted|
    OStyle<keyof CSSStyleDeclaration>|
    ITarget|
    IText|OText|
    IValue<any, string>|OValue<any, string>;

export type InputOutputThatResolvesWith<T> = (InputOutput&ReferenceI<any, T>)|(InputOutput&ReferenceO<any, any, any, T>);
