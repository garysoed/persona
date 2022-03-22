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
  resolve(target: Target, context: RenderContext): Observable<T>;
};

export type ResolvedO<T, U, A extends readonly unknown[]> = {
  resolve(target: Target, context: RenderContext): (...args: A) => OperatorFunction<T, U>;
  readonly ioType: IOType.OUTPUT;
};

export type Resolved<O> =
    O extends IAttr ? IAttr&ResolvedI<string|null> :
    O extends OAttr ? OAttr&ResolvedO<string|null, string|null, []> :
    O extends ICall<infer A, infer M> ? ICall<A, M>&ResolvedI<A> :
    O extends OCall<infer A, infer M> ? OCall<A, M>&ResolvedO<A, A, []> :
    O extends OCase<infer V> ? OCase<V>&ResolvedO<V, V, [RenderValueFn<V>]> :
    O extends IClass ? IClass&ResolvedI<boolean> :
    O extends OClass ? OClass&ResolvedO<boolean, boolean, []> :
    O extends IEvent<infer E> ? IEvent<E>&ResolvedI<E> :
    O extends OEvent<infer E> ? OEvent<E>&ResolvedO<E, E, []> :
    O extends IFlag ? IFlag&ResolvedI<boolean> :
    O extends OFlag ? OFlag&ResolvedO<boolean, boolean, []> :
    O extends OForeach<infer V> ? OForeach<V>&ResolvedO<readonly V[], readonly V[], [RenderValuesFn<V>]> :
    O extends IKeydown ? IKeydown&ResolvedI<KeyboardEvent> :
    O extends IMedia ? IMedia&ResolvedI<boolean> :
    O extends IRect ? IRect&ResolvedI<DOMRect> :
    O extends ISlotted ? ISlotted&ResolvedI<readonly Node[]> :
    O extends OSlotted ? OSlotted&ResolvedO<readonly Node[], readonly Node[], []> :
    O extends OStyle<infer S> ? OStyle<S>&ResolvedO<string, string, []> :
    O extends ITarget ? ITarget&ResolvedI<HTMLElement> :
    O extends IText ? IText&ResolvedI<string> :
    O extends OText ? OText&ResolvedO<string, string, []> :
    O extends IValue<infer V, infer P> ? IValue<V, P>&ResolvedI<V> :
    O extends OValue<infer V, infer P> ? OValue<V, P>&ResolvedO<V, V, []> : never;

export type ResolvedProvider<V> = (root: Target, context: RenderContext) => Binding<V>;

export type UnresolvedIO<T extends Target, B> = B & {
  resolve(target: T, context: RenderContext): Resolved<B>;
};

export type BindingSpec = {
  readonly [key: string]: unknown;
}

export type UnresolvedBindingSpec<T extends Target> = {
  readonly [key: string]: UnresolvedIO<T, InputOutput>;
}

export type ResolvedBindingSpec = {
  readonly [key: string]: Resolved<InputOutput>
};

export type ResolvedBindingSpecProvider<S extends ResolvedBindingSpec> = {
  readonly [K in keyof S]: ResolvedProvider<S[K]>;
}

export type Spec = {
  readonly host?: ResolvedBindingSpec;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<ResolvedBindingSpec>>;
};

export type InputBinding<V> = Observable<V>;
export type OutputBinding<T, U, A extends readonly unknown[]> = (...args: A) => OperatorFunction<T, U>;
export type Binding<O> =
    Resolved<O> extends ResolvedI<infer V> ? InputBinding<V> :
    Resolved<O> extends ResolvedO<infer V, infer T, infer A> ? OutputBinding<V, T, A> :
    never;

export type Bindings<S extends BindingSpec> = {
  readonly [K in keyof S]: Binding<S[K]>;
};

export type ShadowBindings<O> = {
  readonly [K in keyof O]: O[K] extends ResolvedBindingSpecProvider<infer S> ? Bindings<S> : never;
};

export interface Context<S extends Spec> {
  readonly host: Bindings<S['host']&{}>;
  readonly shadow: ShadowBindings<S['shadow']&{}>;
  readonly shadowRoot: ShadowRoot;
  readonly element: HTMLElement;
  readonly vine: Vine;
}

export type CtrlCtor<H extends Spec> = new (context: Context<H>) => Ctrl;