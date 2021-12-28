import {Vine} from 'grapevine';
import {Observable, OperatorFunction} from 'rxjs';

import {RenderContext} from '../render/types/render-context';
import {RenderSpec} from '../render/types/render-spec';

import {IAttr, ICall, IClass, IEvent, IFlag, IKeydown, IMedia, InputOutput, IRect, ISlotted, ITarget, IText, IValue, OAttr, OCall, OClass, OEvent, OFlag, OMulti, OSingle, OSlotted, OStyle, OText, OValue} from './io';
import {Target} from './target';


export interface Ctrl {
  readonly runs: ReadonlyArray<Observable<unknown>>;
}

// TODO(#8): Remove exports of ResolvedI and ResolvedO
export type ResolvedI<T> = {
  readonly value$: Observable<T>;
};

export type ResolvedO<T, U> = {
  update: () => OperatorFunction<T, U>;
};

export type Resolved<T extends InputOutput> =
    T extends IAttr ? IAttr&ResolvedI<string|null> :
    T extends OAttr ? OAttr&ResolvedO<string|null, string|null> :
    T extends ICall<infer A, infer M> ? ICall<A, M>&ResolvedI<A> :
    T extends OCall<infer A, infer M> ? OCall<A, M>&ResolvedO<A, A> :
    T extends IClass ? IClass&ResolvedI<boolean> :
    T extends OClass ? OClass&ResolvedO<boolean, boolean> :
    T extends IEvent ? IEvent&ResolvedI<Event> :
    T extends OEvent ? OEvent&ResolvedO<Event, Event> :
    T extends IFlag ? IFlag&ResolvedI<boolean> :
    T extends OFlag ? OFlag&ResolvedO<boolean, boolean> :
    T extends IKeydown ? IKeydown&ResolvedI<KeyboardEvent> :
    T extends IMedia ? IMedia&ResolvedI<boolean> :
    T extends OMulti ? OMulti&ResolvedO<readonly RenderSpec[], readonly RenderSpec[]> :
    T extends IRect ? IRect&ResolvedI<DOMRect> :
    T extends OSingle ? OSingle&ResolvedO<RenderSpec|null, RenderSpec|null> :
    T extends ISlotted ? ISlotted&ResolvedI<readonly Node[]> :
    T extends OSlotted ? OSlotted&ResolvedO<readonly Node[], readonly Node[]> :
    T extends OStyle<infer S> ? OStyle<S>&ResolvedO<CSSStyleDeclaration[S], CSSStyleDeclaration[S]> :
    T extends ITarget ? ITarget&ResolvedI<HTMLElement> :
    T extends IText ? IText&ResolvedI<string> :
    T extends OText ? OText&ResolvedO<string, string> :
    T extends IValue<infer V, infer P> ? IValue<V, P>&ResolvedI<V> :
    T extends OValue<infer V, infer P> ? OValue<V, P>&ResolvedO<V, V> : never;

export type ResolvedProvider<T extends InputOutput> =
    (root: ShadowRoot, context: RenderContext) => Resolved<T>;

export type UnresolvedIO<B extends InputOutput> = B & {
  resolve(target: Target, context: RenderContext): Resolved<B>;
};

export type BindingSpec = {
  readonly [key: string]: InputOutput;
}

export type UnresolvedBindingSpec = {
  readonly [key: string]:
      UnresolvedIO<IAttr>|UnresolvedIO<OAttr>|
      UnresolvedIO<ICall<unknown, any>>|
      UnresolvedIO<IClass>|UnresolvedIO<OClass>|
      UnresolvedIO<IEvent>|UnresolvedIO<OEvent>|
      UnresolvedIO<IFlag>|UnresolvedIO<OFlag>|
      UnresolvedIO<OMulti>|
      UnresolvedIO<OSingle>|
      UnresolvedIO<ISlotted>|UnresolvedIO<OSlotted>|
      UnresolvedIO<IText>|UnresolvedIO<OText>|
      UnresolvedIO<IValue<unknown, any>>|UnresolvedIO<OValue<any, any>>;
}

export type ResolvedBindingSpec<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends InputOutput ? Resolved<S[K]> :
      never;
};

export type ResolvedBindingSpecProvider<S extends UnresolvedBindingSpec> = {
  readonly [K in keyof S]:
      S[K] extends InputOutput ? ResolvedProvider<S[K]> :
      never;
}

export type Spec = {
  readonly host?: UnresolvedBindingSpec;
  readonly shadow?: Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
};

export type Binding<T extends InputOutput> =
    Resolved<T> extends ResolvedI<infer V> ? Observable<V> :
    Resolved<T> extends ResolvedO<infer V, infer T> ? () => OperatorFunction<V, T> :
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