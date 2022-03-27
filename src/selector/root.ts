import {RenderContext} from '../render/types/render-context';
import {InputBinding, OutputBinding, ResolvedBindingSpecProvider} from '../types/ctrl';
import {InputOutputThatResolvesWith} from '../types/io';
import {Target} from '../types/target';

type Binding = (root: Target, context: RenderContext) => InputBinding<any>|OutputBinding<any, any, any[]>;

type ExtraBindings = {
  readonly [key: string]: InputOutputThatResolvesWith<Target>;
};
export function root<X extends ExtraBindings>(
    specs: X,
): ResolvedBindingSpecProvider<X, Target> {
  const providers: Record<string, Binding> = {};

  const normalizedSpecs: ExtraBindings = specs ?? {};
  for (const key in normalizedSpecs) {
    providers[key] = (root: Target, context: RenderContext) => normalizedSpecs[key].resolve(
        root,
        context,
    );
  }
  return providers as ResolvedBindingSpecProvider<X, Target>;
}