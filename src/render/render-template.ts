import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap, switchMapTo} from 'rxjs/operators';

import {createBinding, OutputBinding} from '../core/create-bindings';
import {Bindings, BindingSpec, ResolvedBindingSpecProvider, UnresolvedBindingSpec} from '../types/ctrl';
import {Target} from '../types/target';

import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTemplateSpec, TemplateBindings, TemplateBindingSpec} from './types/render-template-spec';


export function renderTemplate<S extends TemplateBindingSpec>(
    renderSpec: RenderTemplateSpec<S>,
    context: RenderContext,
): Observable<Node> {
  return renderSpec.template$.pipe(
      switchMap(template => {
        const content: DocumentFragment = template.content.cloneNode(true) as DocumentFragment;
        return renderNode({
          node: content,
          type: RenderSpecType.NODE,
        });
      }),
      switchMap(target => {
        const bindings = createTemplateBindingObjects(renderSpec.spec, target, context);
        const obsList = renderSpec.runs(bindings);

        return merge(
            of(target),
            merge(...obsList).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}

// TODO: Consolidate this with the one for shadow in in upgrade-element.
function createTemplateBindingObjects<O extends TemplateBindingSpec>(
    spec: O,
    target: Target,
    context: RenderContext,
): TemplateBindings<O> {
  const partial: Record<string, Bindings<BindingSpec>> = {};
  for (const key in spec) {
    partial[key] = createTemplateBindings(spec[key], target, context);
  }
  return partial as TemplateBindings<O>;
}

function createTemplateBindings<S extends UnresolvedBindingSpec>(
    spec: ResolvedBindingSpecProvider<S>,
    target: Target,
    context: RenderContext,
): Bindings<S> {
  const partial: Partial<Record<string, Observable<unknown>|OutputBinding>> = {};
  for (const key in spec) {
    partial[key] = createBinding(spec[key](target, context));
  }
  return partial as Bindings<S>;
}