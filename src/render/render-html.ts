import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';

import { $htmlParseService, ParseType } from './html-parse-service';


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
    raw: string,
    supportedType: ParseType,
    context: PersonaContext,
): Observable<Node|null> {
  return $htmlParseService.get(context.vine).pipe(
      switchMap(service => service.parse(raw, supportedType)),
      map(el => el?.cloneNode(true) || null),
  );
}
