import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';

import {$htmlParseService} from './html-parse-service';
import {NodeWithId} from './node-with-id';
import {renderNode} from './render-node';
import {normalize} from './types/observable-or-value';
import {RenderHtmlSpec} from './types/render-html-spec';
import {RenderSpecType} from './types/render-spec-type';


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
export function renderHtml(
    spec: RenderHtmlSpec,
    context: PersonaContext,
): Observable<NodeWithId<Element>|null> {
  return combineLatest([
    $htmlParseService.get(context.vine),
    normalize(spec.raw),
  ])
      .pipe(
          switchMap(([service, raw]) => service.parse(raw, spec.parseType)),
          switchMap(el => {
            if (!el) {
              return observableOf(null);
            }

            return renderNode({
              type: RenderSpecType.NODE,
              node: el.cloneNode(true) as Element,
              id: spec.id,
            });
          }),
          switchMap(node => {
            if (!node || !spec.decorator) {
              return observableOf(node);
            }

            return observableOf(node).pipe(spec.decorator);
          }),
      );
}
