import {RenderContext} from '../render/types/render-context';
import {Resolved, ResolvedBindingSpec, UnresolvedBindingSpec} from '../types/ctrl';
import {InputOutput} from '../types/io';

export function resolveForHost<S extends UnresolvedBindingSpec>(
    spec: S,
    target: HTMLElement,
    context: RenderContext,
): ResolvedBindingSpec<S> {
  const bindings: Partial<Record<keyof S, Resolved<InputOutput>>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = io.resolve(target, context);
  }
  return bindings as ResolvedBindingSpec<S>;
}