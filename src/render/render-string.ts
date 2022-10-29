import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMap, switchMapTo} from 'rxjs/operators';

import {Bindings, BindingSpec, OutputBinding, ResolvedBindingSpec, ResolvedBindingSpecProvider} from '../types/ctrl';

import {$htmlParseService, ElementForType, ParseType} from './html-parse-service';
import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderSpecType} from './types/render-spec-type';
import {ExtraHtmlBindings, ExtraSpec, RenderStringSpec} from './types/render-string-spec';


/**
 * Emits node rendered using the given raw string.
 *
 * @param raw - The string representation of the HTML.
 * @param supportedType - Type of the raw string for parsing.
 * @param context - The Persona context.
 * @returns Observable that emits the Node created using the given raw string.
 *
 * @thModule render
 */
export function renderString<T extends ParseType>(
    spec: RenderStringSpec<T, ExtraSpec>,
    context: RenderContext,
): Observable<ElementForType<T>|null> {
  const service = $htmlParseService.get(context.vine);
  return spec.raw
      .pipe(
          switchMap(raw => service.parse(raw, spec.parseType)),
          switchMap(el => {
            if (!el) {
              return of(null);
            }

            const target = el.cloneNode(true) as ElementForType<T>;
            const node$ = renderNode({
              ...spec,
              type: RenderSpecType.NODE,
              node: target,
            });

            const bindings = createExtraBindingObjects(spec.spec, target, context);
            const obsList = spec.runs(bindings);

            return merge(
                node$,
                merge(...obsList).pipe(switchMapTo(EMPTY)),
            );
          }),
      );
}

// TODO: Consolidate this with the one for shadow in in upgrade-element.
function createExtraBindingObjects<O extends ExtraSpec>(
    spec: O,
    target: Element,
    context: RenderContext,
): ExtraHtmlBindings<O> {
  const partial: Record<string, Bindings<BindingSpec, unknown>> = {};
  for (const key in spec) {
    partial[key] = createExtraBindings(spec[key], target, context);
  }
  return partial as ExtraHtmlBindings<O>;
}

function createExtraBindings<S extends ResolvedBindingSpec>(
    spec: ResolvedBindingSpecProvider<S, unknown>,
    target: Element,
    context: RenderContext,
): Bindings<S, unknown> {
  const partial: Partial<Record<string, Observable<unknown>|OutputBinding<any, any, any[]>>> = {};
  for (const key in spec) {
    partial[key] = spec[key](target, context);
  }
  return partial as Bindings<S, unknown>;
}