import {RenderContext} from '../render/types/render-context';
import {Bindings, InputBinding, OutputBinding, ResolvedBindingSpec} from '../types/ctrl';
import {Target} from '../types/target';


export function createBindings<S extends ResolvedBindingSpec>(
    spec: ResolvedBindingSpec,
    target: Target,
    context: RenderContext,
): Bindings<S> {
  const bindings: Record<string, InputBinding<any>|OutputBinding<any, any, any[]>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = io.resolve(target, context);
  }
  return bindings as Bindings<S>;
}
