import {EMPTY, Observable, merge, of as observableOf} from 'rxjs';
import {switchMap, switchMapTo} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {UnresolvedSpec, api} from '../main/api';
import {ComponentSpec} from '../main/component-spec';
import {UnresolvedInput} from '../types/unresolved-input';
import {UnresolvedOutput} from '../types/unresolved-output';

import {__id} from './node-with-id';
import {Values as ElementValues, renderElement} from './render-element';


/**
 * Values of the input for the given spec.
 *
 * @remarks
 * The values must be `Observable`. They must emit whenever the value changes to update the values
 * of the custom element.
 *
 * @thHidden
 */
export type InputsOf<S extends UnresolvedSpec> = Partial<{
  readonly [K in keyof S]: S[K] extends UnresolvedInput<infer T> ? Observable<T> : never;
}>;

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
    spec: ComponentSpec<S>,
    values: Values<S>,
    id: unknown,
    context: PersonaContext,
): Observable<HTMLElement&{[__id]: unknown}> {
  return renderElement(spec.tag, values, id, context).pipe(
      switchMap(el => {
        const resolver = (): HTMLElement => el;
        const onChange$List = [];

        const convertedSpec = api(spec.api);
        const inputs: InputsOf<S> = values.inputs || {};
        for (const key in inputs) {
          if (!inputs.hasOwnProperty(key)) {
            continue;
          }

          const output = (convertedSpec[key] as UnresolvedOutput<any>).resolve(resolver);
          onChange$List.push((inputs[key] as Observable<any>).pipe(output.output(context)));
        }

        return merge(
            observableOf(el),
            merge(...onChange$List).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}
