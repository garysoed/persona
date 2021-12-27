import {Observable, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';


import {$htmlParseService} from './html-parse-service';
import {renderNode} from './render-node';
import {NodeWithId} from './types/node-with-id';
import {RenderContext} from './types/render-context';
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
    context: RenderContext,
): Observable<NodeWithId<Element>|null> {
  const service = $htmlParseService.get(context.vine);
  return spec.raw
      .pipe(
          switchMap(raw => service.parse(raw, spec.parseType)),
          switchMap(el => {
            if (!el) {
              return observableOf(null);
            }

            return renderNode({
              ...spec,
              type: RenderSpecType.NODE,
              node: el.cloneNode(true) as Element,
            });
          }),
      );
}
