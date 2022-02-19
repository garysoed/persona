import {RenderContext} from '../render/types/render-context';
import {ResolvedBindingSpecProvider, ResolvedProvider, UnresolvedBindingSpec, UnresolvedIO} from '../types/ctrl';
import {InputOutput, OForeach, OMulti, OSingle, OText} from '../types/io';


export type ExtraUnresolvedBindingSpec = Record<
    string,
    UnresolvedIO<OForeach<any>>|
    UnresolvedIO<OMulti>|
    UnresolvedIO<OSingle>|
    UnresolvedIO<OText>
>;

export function root<X extends ExtraUnresolvedBindingSpec&UnresolvedBindingSpec>(
    specs: X,
): ResolvedBindingSpecProvider<X> {
  const providers: Partial<Record<string, ResolvedProvider<InputOutput>>> = {};

  const normalizedSpecs: ExtraUnresolvedBindingSpec = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: ShadowRoot, context: RenderContext) => normalizedSpecs[key].resolve(
        root,
        context,
    );
  }
  return providers as unknown as ResolvedBindingSpecProvider<X>;
}