import {combineLatest, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';

import {$htmlParseService} from './html-parse-service';
import {NodeWithId} from './node-with-id';
import {setId} from './set-id';
import {normalize} from './types/observable-or-value';
import {RenderHtmlSpec} from './types/render-html-spec';


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
          map(el => {
            if (!el) {
              return null;
            }
            return setId(el.cloneNode(true) as Element, spec.id);
          }),
      );
}
