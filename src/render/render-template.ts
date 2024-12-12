import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {
  Bindings,
  BindingSpec,
  OutputBinding,
  ResolvedBindingSpec,
  ResolvedBindingSpecProvider,
} from '../types/ctrl';

import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderSpecType} from './types/render-spec-type';
import {
  RenderTemplateSpec,
  TemplateBindings,
  TemplateBindingSpec,
} from './types/render-template-spec';

export function renderTemplate<S extends TemplateBindingSpec>(
  renderSpec: RenderTemplateSpec<S>,
  context: RenderContext,
): Observable<Node> {
  return renderSpec.template$.pipe(
    switchMap((template) => {
      const content: DocumentFragment = template.content.cloneNode(
        true,
      ) as DocumentFragment;
      return renderNode({
        node: content,
        type: RenderSpecType.NODE,
      });
    }),
    switchMap((target) => {
      const bindings = createTemplateBindingObjects(
        renderSpec.spec,
        target,
        context,
      );
      const obsList = renderSpec.runs(bindings);

      return merge(of(target), merge(...obsList).pipe(switchMap(() => EMPTY)));
    }),
  );
}

// TODO: Consolidate this with the one for shadow in in upgrade-element.
function createTemplateBindingObjects<O extends TemplateBindingSpec>(
  specs: O,
  target: DocumentFragment,
  context: RenderContext,
): TemplateBindings<O> {
  const partial: Record<string, Bindings<BindingSpec, unknown>> = {};
  for (const key in specs) {
    const spec = specs[key];
    if (!spec) {
      throw new Error(`No spec for key ${String(key)} found`);
    }
    partial[key] = createTemplateBindings(spec, target, context);
  }
  return partial as TemplateBindings<O>;
}

function createTemplateBindings<S extends ResolvedBindingSpec>(
  spec: ResolvedBindingSpecProvider<S, unknown>,
  target: DocumentFragment,
  context: RenderContext,
): Bindings<S, unknown> {
  const partial: Partial<
    Record<string, Observable<unknown> | OutputBinding<any, any, any[]>>
  > = {};
  for (const key in spec) {
    partial[key] = spec[key](target, context);
  }
  return partial as Bindings<S, unknown>;
}
