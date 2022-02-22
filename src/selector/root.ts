import {RenderContext} from '../render/types/render-context';
import {ResolvedBindingSpecProvider, ResolvedProvider, UnresolvedBindingSpec, UnresolvedIO} from '../types/ctrl';
import {InputOutput, OCase, OForeach, OText} from '../types/io';
import {Target} from '../types/target';


export type ExtraUnresolvedBindingSpec = Record<
    string,
    UnresolvedIO<OCase<any>>|
    UnresolvedIO<OForeach<any>>|
    UnresolvedIO<OText>
>;

export function root<X extends ExtraUnresolvedBindingSpec&UnresolvedBindingSpec>(
    specs: X,
): ResolvedBindingSpecProvider<X> {
  const providers: Partial<Record<string, ResolvedProvider<InputOutput>>> = {};

  const normalizedSpecs: ExtraUnresolvedBindingSpec = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: Target, context: RenderContext) => normalizedSpecs[key].resolve(
        root,
        context,
    );
  }
  return providers as unknown as ResolvedBindingSpecProvider<X>;
}