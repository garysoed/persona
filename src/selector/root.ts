import {RenderContext} from '../render/types/render-context';
import {ResolvedBindingSpecProvider, ResolvedProvider, UnresolvedBindingSpec} from '../types/ctrl';
import {InputOutput} from '../types/io';
import {Target} from '../types/target';


export function root<X extends UnresolvedBindingSpec>(
    specs: X,
): ResolvedBindingSpecProvider<X> {
  const providers: Partial<Record<string, ResolvedProvider<InputOutput>>> = {};

  const normalizedSpecs: UnresolvedBindingSpec = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: Target, context: RenderContext) => normalizedSpecs[key].resolve(
        root,
        context,
    );
  }
  return providers as unknown as ResolvedBindingSpecProvider<X>;
}