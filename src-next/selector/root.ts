import {ResolvedBindingSpecProvider, ResolvedProvider, UnresolvedBindingSpec, UnresolvedIO} from '../types/ctrl';
import {InputOutput, OSingle} from '../types/io';


export type ExtraUnresolvedBindingSpec = Record<
    string,
    UnresolvedIO<OSingle>
>;

export function root<X extends ExtraUnresolvedBindingSpec&UnresolvedBindingSpec>(
    specs: X,
): ResolvedBindingSpecProvider<X> {
  const providers: Partial<Record<string, ResolvedProvider<InputOutput>>> = {};

  const normalizedSpecs: ExtraUnresolvedBindingSpec = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: ShadowRoot) => normalizedSpecs[key].resolve(root);
  }
  return providers as unknown as ResolvedBindingSpecProvider<X>;
}