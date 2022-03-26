import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderContext} from '../render/types/render-context';

import {InputOutput, ReferenceI, ReferenceO} from './io';
import {Target} from './target';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

// TODO(#8): Remove exports of ResolvedI and ResolvedO


// export type Reference<O> =
//     O extends IAttr ? IAttr&ReferenceI<string|null> :
//     O extends OAttr ? OAttr&ReferenceO<string|null, string|null, []> :
//     O extends ICall<infer A, infer M> ? ICall<A, M>&ReferenceI<A> :
//     O extends OCall<infer A, infer M> ? OCall<A, M>&ReferenceO<A, A, []> :
//     O extends OCase<infer V> ? OCase<V>&ReferenceO<V, V, [RenderValueFn<V>]> :
//     O extends IClass ? IClass&ReferenceI<boolean> :
//     O extends OClass ? OClass&ReferenceO<boolean, boolean, []> :
//     O extends IEvent<infer E> ? IEvent<E>&ReferenceI<E> :
//     O extends OEvent<infer E> ? OEvent<E>&ReferenceO<E, E, []> :
//     O extends IFlag ? IFlag&ReferenceI<boolean> :
//     O extends OFlag ? OFlag&ReferenceO<boolean, boolean, []> :
//     O extends OForeach<infer V> ? OForeach<V>&ReferenceO<readonly V[], readonly V[], [RenderValuesFn<V>]> :
//     O extends IKeydown ? IKeydown&ReferenceI<KeyboardEvent> :
//     O extends IMedia ? IMedia&ReferenceI<boolean> :
//     O extends IRect ? IRect&ReferenceI<DOMRect> :
//     O extends ISlotted ? ISlotted&ReferenceI<readonly Node[]> :
//     O extends OSlotted ? OSlotted&ReferenceO<readonly Node[], readonly Node[], []> :
//     O extends OStyle<infer S> ? OStyle<S>&ReferenceO<string, string, []> :
//     O extends ITarget ? ITarget&ReferenceI<HTMLElement> :
//     O extends IText ? IText&ReferenceI<string> :
//     O extends OText ? OText&ReferenceO<string, string, []> :
//     O extends IValue<infer V, infer P> ? IValue<V, P>&ReferenceI<V> :
//     O extends OValue<infer V, infer P> ? OValue<V, P>&ReferenceO<V, V, []> : never;

export type ResolvedProvider<V> = (root: Target, context: RenderContext) => Binding<V>;

export type BindingSpec = {
  readonly [key: string]: unknown;
}

export type ResolvedBindingSpec = {
  readonly [key: string]: InputOutput;
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
    O extends ReferenceI<infer V> ? InputBinding<V> :
    O extends ReferenceO<infer V, infer T, infer A> ? OutputBinding<V, T, A> :
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