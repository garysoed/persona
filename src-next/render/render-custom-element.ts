import {getOwnPropertyKeys} from 'gs-tools/export/typescript';
import {EMPTY, merge, Observable, of, Subject} from 'rxjs';
import {switchMap, switchMapTo, tap} from 'rxjs/operators';

import {Spec, UnresolvedBindingSpec} from '../types/ctrl';
import {IOType} from '../types/io';
import {reverseSpec} from '../util/reverse-spec';

import {renderElement, Values as ElementValues} from './render-element';
import {NodeWithId} from './types/node-with-id';
import {RenderContext} from './types/render-context';
import {InputsOf, NormalizedInputsOf, OutputsOf, RenderCustomElementSpec} from './types/render-custom-element-spec';
import {RenderSpecType} from './types/render-spec-type';


/**
 * Values to use for rendering the custom element.
 *
 * @thHidden
 */
export interface Values<S extends UnresolvedBindingSpec> extends ElementValues {
  /**
   * Inputs to the custom element.
   */
  readonly inputs?: InputsOf<S>;
}

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
): Observable<NodeWithId<HTMLElement>> {
  const elementSpec = {
    ...renderSpec,
    tag: renderSpec.registration.tag,
    type: RenderSpecType.ELEMENT as const,
  };
  return renderElement(elementSpec, context).pipe(
      switchMap(el => {
        const onChange$List = [];

        const reversed = reverseSpec(renderSpec.registration.spec.host ?? {});
        const inputs: NormalizedInputsOf<S['host']&{}> = renderSpec.inputs ?? {};
        for (const key of getOwnPropertyKeys(inputs)) {
          const output = reversed[key as string].resolve(el, context);
          if (output.ioType !== IOType.OUTPUT) {
            continue;
          }
          onChange$List.push((inputs[key] as Observable<any>).pipe(output.update()));
        }

        const outputs: OutputsOf<S['host']&{}> = renderSpec.onOutputs ?? {};
        for (const key of getOwnPropertyKeys(outputs)) {
          const input = reversed[key as string].resolve(el, context);
          if (input.ioType !== IOType.INPUT) {
            continue;
          }
          onChange$List.push((input.value$ as Observable<any>).pipe(
              tap(value => (outputs[key] ?? new Subject()).next(value)),
          ));
        }

        return merge(
            of(el),
            merge(...onChange$List).pipe(switchMapTo(EMPTY)),
        );
      }),
  );
}
