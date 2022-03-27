import {RenderContext} from '../render/types/render-context';
import {Bindings, InputBinding, OutputBinding, ResolvedBindingSpec} from '../types/ctrl';
import {InputOutputThatResolvesWith} from '../types/io';


export function createBindings<S extends ResolvedBindingSpec>(
    spec: Record<string, InputOutputThatResolvesWith<Element>>,
    target: Element,
    context: RenderContext,
): Bindings<S, Element> {
  const bindings: Record<string, InputBinding<any>|OutputBinding<any, any, any[]>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = io.resolve(target, context);
  }
  return bindings as Bindings<S, Element>;
}
