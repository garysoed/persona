import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {EMPTY, merge, Observable, of as observableOf} from 'rxjs';
import {switchMap, switchMapTo} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {api, UnresolvedSpec} from '../main/api';
import {UnresolvedOutput} from '../types/unresolved-output';

import {__id} from './node-with-id';
import {renderElement, Values as ElementValues} from './render-element';
import {InputsOf, NormalizedInputsOf, RenderCustomElementSpec} from './types/render-custom-element-spec';
import {RenderSpecType} from './types/render-spec-type';


/**
 * Values to use for rendering the custom element.
 *
 * @thHidden
 */
export interface Values<S extends UnresolvedSpec> extends ElementValues {
  /**
   * Inputs to the custom element.
   */
  readonly inputs?: InputsOf<S>;
}

/**
 * Renders a custom element given the specs and values.
 *
 * @param spec - Custom element's specs.
 * @param values - Values to use for the custom element.
 * @param context - The Persona context.
 * @returns `Observable` that emits the created custom element. This only emits when the element is
 *     created and will not emit if any of the element's properties changes.
 *
 * @thModule render
 */
export function renderCustomElement<S extends UnresolvedSpec>(
    spec: RenderCustomElementSpec<S>,
    context: PersonaContext,
): Observable<HTMLElement&{[__id]: unknown}> {
  const elementSpec = {
    ...spec,
    tag: spec.spec.tag,
    type: RenderSpecType.ELEMENT as const,
  };
  return renderElement(elementSpec, context).pipe(
      switchMap(el => {
        const resolver = (): HTMLElement => el;
        const onChange$List = [];

        const convertedSpec = api(spec.spec.api);
        const inputs: NormalizedInputsOf<S> = spec.inputs || {};
        for (const key of getOwnPropertyKeys(inputs)) {
          const output = (convertedSpec[key as string] as UnresolvedOutput<any>).resolve(resolver);
          onChange$List.push((inputs[key] as Observable<unknown>).pipe(output.output(context)));
        }

        return merge(
            observableOf(el),
            merge(...onChange$List).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}
