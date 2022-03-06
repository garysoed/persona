import {RenderContext} from '../render/types/render-context';
import {ResolvedBindingSpecProvider, ResolvedProvider, UnresolvedBindingSpec} from '../types/ctrl';


export function root<X extends UnresolvedBindingSpec<ShadowRoot>>(
    specs: X,
): ResolvedBindingSpecProvider<ShadowRoot, X> {
  const providers: Partial<Record<string, ResolvedProvider<ShadowRoot, any>>> = {};

  const normalizedSpecs: UnresolvedBindingSpec<ShadowRoot> = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: ShadowRoot, context: RenderContext) => normalizedSpecs[key].resolve(
        root,
        context,
    );
  }
  return providers as ResolvedBindingSpecProvider<ShadowRoot, X>;
}