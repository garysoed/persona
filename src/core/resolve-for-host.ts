import {RenderContext} from '../render/types/render-context';
import {Resolved, ResolvedBindingSpec, UnresolvedBindingSpec} from '../types/ctrl';

export function resolveForHost<S extends UnresolvedBindingSpec>(
    spec: S,
    target: HTMLElement,
    context: RenderContext,
): ResolvedBindingSpec<S> {
  const bindings: Partial<Record<keyof S, Resolved<any>>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = io.resolve(target, context);
  }
  return bindings as ResolvedBindingSpec<S>;
}