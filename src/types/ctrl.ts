import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderContext} from '../render/types/render-context';

import {IAttr, ICall, IClass, IEvent, IFlag, IKeydown, IMedia, InputOutput, IOType, IRect, ISlotted, ITarget, IText, IValue, OAttr, OCall, OCase, OClass, OEvent, OFlag, OForeach, OSlotted, OStyle, OText, OValue, RenderValueFn, RenderValuesFn} from './io';
import {Target} from './target';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

// TODO(#8): Remove exports of ResolvedI and ResolvedO
export type ResolvedI<T> = {
  readonly ioType: IOType.INPUT;
  readonly value$: Observable<T>;
};

export type ResolvedO<T, U, A extends readonly unknown[]> = {
  update: (...args: A) => OperatorFunction<T, U>;
  readonly ioType: IOType.OUTPUT;
};

export type Resolved<T> =
    T extends IAttr ? IAttr&ResolvedI<string|null> :
    T extends OAttr ? OAttr&ResolvedO<string|null, string|null, []> :
    T extends ICall<infer A, infer M> ? ICall<A, M>&ResolvedI<A> :
    T extends OCall<infer A, infer M> ? OCall<A, M>&ResolvedO<A, A, []> :
    T extends OCase<infer V> ? OCase<V>&ResolvedO<V, V, [RenderValueFn<V>]> :
    T extends IClass ? IClass&ResolvedI<boolean> :
    T extends OClass ? OClass&ResolvedO<boolean, boolean, []> :
    T extends IEvent<infer E> ? IEvent<E>&ResolvedI<E> :
    T extends OEvent<infer E> ? OEvent<E>&ResolvedO<E, E, []> :
    T extends IFlag ? IFlag&ResolvedI<boolean> :
    T extends OFlag ? OFlag&ResolvedO<boolean, boolean, []> :
    T extends OForeach<infer V> ? OForeach<V>&ResolvedO<readonly V[], readonly V[], [RenderValuesFn<V>]> :
    T extends IKeydown ? IKeydown&ResolvedI<KeyboardEvent> :
    T extends IMedia ? IMedia&ResolvedI<boolean> :
    T extends IRect ? IRect&ResolvedI<DOMRect> :
    T extends ISlotted ? ISlotted&ResolvedI<readonly Node[]> :
    T extends OSlotted ? OSlotted&ResolvedO<readonly Node[], readonly Node[], []> :
    T extends OStyle<infer S> ? OStyle<S>&ResolvedO<string, string, []> :
    T extends ITarget ? ITarget&ResolvedI<HTMLElement> :
    T extends IText ? IText&ResolvedI<string> :
    T extends OText ? OText&ResolvedO<string, string, []> :
    T extends IValue<infer V, infer P> ? IValue<V, P>&ResolvedI<V> :
    T extends OValue<infer V, infer P> ? OValue<V, P>&ResolvedO<V, V, []> : never;

export type ResolvedProvider<T extends Target, V> =
    (root: T, context: RenderContext) => Resolved<V>;

export type UnresolvedIO<T extends Target, B> = B & {
  resolve(target: T, context: RenderContext): Resolved<B>;
};

export type BindingSpec = {
  readonly [key: string]: unknown;
}

export type UnresolvedBindingSpec<T extends Target> = {
  readonly [key: string]: UnresolvedIO<T, InputOutput>;
}

export type ResolvedBindingSpec<T extends Target, S extends UnresolvedBindingSpec<T>> = {
  readonly [K in keyof S]: Resolved<S[K]>
};

export type ResolvedBindingSpecProvider<T extends Target, S extends UnresolvedBindingSpec<Target>> = {
  readonly [K in keyof S]: ResolvedProvider<T, S[K]>;
}

export type Spec = {
  readonly host?: UnresolvedBindingSpec<HTMLElement>;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<ShadowRoot, UnresolvedBindingSpec<ShadowRoot>>>;
};

export type Binding<T> =
    Resolved<T> extends ResolvedI<infer V> ? Observable<V> :
    Resolved<T> extends ResolvedO<infer V, infer T, infer A> ? (...args: A) => OperatorFunction<V, T> :
    never;

export type Bindings<S extends BindingSpec> = {
  readonly [K in keyof S]: Binding<S[K]>;
};

export type ShadowBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<ShadowRoot, infer S> ? Bindings<S> : never;
};

export interface Context<S extends Spec> {
  readonly host: Bindings<S['host']&{}>;
  readonly shadow: ShadowBindings<S['shadow']&{}>;
  readonly shadowRoot: ShadowRoot;
  readonly element: HTMLElement;
  readonly vine: Vine;
}

export type CtrlCtor<H extends Spec> = new (context: Context<H>) => Ctrl;