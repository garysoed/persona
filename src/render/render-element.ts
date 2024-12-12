import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap, switchMapTo} from 'rxjs/operators';

import {createBindings} from '../core/create-bindings';
import {Spec} from '../types/ctrl';
import {ReversedSpec, reverseSpec} from '../util/reverse-spec';

import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {
  ExtraSpec,
  RenderElementSpec as RenderElementSpec,
} from './types/render-element-spec';
import {RenderSpecType} from './types/render-spec-type';

/**
 * Renders a custom element given the specs and values.
 *
 * @param renderSpec - Custom element's specs.
 * @param values - Values to use for the custom element.
 * @param context - The Persona context.
 * @returns `Observable` that emits the created custom element. This only emits when the element is
 *     created and will not emit if any of the element's properties changes.
 *
 * @thModule render
 */
export function renderElement<
  S extends Spec,
  X extends ExtraSpec,
  E extends Element,
>(
  renderSpec: RenderElementSpec<S, X, E>,
  context: RenderContext,
): Observable<Element> {
  const nodeSpec = {
    ...renderSpec,
    node: context.document.createElementNS(
      renderSpec.registration.namespace,
      renderSpec.registration.tag,
    ),
    type: RenderSpecType.NODE as const,
  };
  return renderNode(nodeSpec).pipe(
    switchMap((el) => {
      const reversed = reverseSpec(renderSpec.registration.spec.host ?? {});
      const bindings = createBindings<ReversedSpec<S['host'] & {}> & X>(
        {...reversed, ...renderSpec.spec},
        el,
        context,
      );
      const runs = renderSpec.runs(bindings);

      return merge(of(el), merge(...runs).pipe(switchMapTo(EMPTY)));
    }),
  );
}
