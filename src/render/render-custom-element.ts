import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap, switchMapTo} from 'rxjs/operators';

import {createBindings} from '../core/create-bindings';
import {resolveForHost} from '../core/resolve-for-host';
import {Spec} from '../types/ctrl';
import {reverseSpec} from '../util/reverse-spec';

import {renderElement} from './render-element';
import {RenderContext} from './types/render-context';
import {RenderCustomElementSpec} from './types/render-custom-element-spec';
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
export function renderCustomElement<S extends Spec>(
    renderSpec: RenderCustomElementSpec<S>,
    context: RenderContext,
): Observable<HTMLElement> {
  const elementSpec = {
    ...renderSpec,
    tag: renderSpec.registration.tag,
    type: RenderSpecType.ELEMENT as const,
  };
  return renderElement(elementSpec, context).pipe(
      switchMap(el => {
        const reversed = resolveForHost(
            reverseSpec<HTMLElement, S['host']&{}>(renderSpec.registration.spec.host ?? {}),
            el,
            context,
        );
        const bindings = createBindings(reversed);
        const runs = renderSpec.runs(bindings);

        return merge(
            of(el),
            merge(...runs).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}
