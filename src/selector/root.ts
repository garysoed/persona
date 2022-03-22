import {RenderContext} from '../render/types/render-context';
import {InputBinding, OutputBinding, ResolvedBindingSpec, ResolvedBindingSpecProvider} from '../types/ctrl';
import {Target} from '../types/target';

type Binding = (root: Target, context: RenderContext) => InputBinding<any>|OutputBinding<any, any, any[]>;

export function root<X extends ResolvedBindingSpec>(
    specs: X,
): ResolvedBindingSpecProvider<X> {
  const providers: Record<string, Binding> = {};

  const normalizedSpecs: ResolvedBindingSpec = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: Target, context: RenderContext) => normalizedSpecs[key].resolve(
        root,
        context,
    );
  }
  return providers as ResolvedBindingSpecProvider<X>;
}