import {Observable, OperatorFunction, pipe} from 'rxjs';
import {map, shareReplay, tap, withLatestFrom} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {ownerDocument} from '../input/owner-document';
import {Output} from '../types/output';


/**
 * Sets the favicon of the owner document of the context.
 *
 * @remarks
 * If the `<link>` element doesn't exist, this will create one and add it to the document's
 * `<head>`. Otherwise, it will try to reuse one.
 */
export class Favicon implements Output<string> {
  readonly type = 'out';

  /**
   * Sets the favicon of the owner document in the context.
   *
   * @param context - Context whose owner document's favicon should be set.
   * @returns Operator that takes in the favicon's href and sets the owner document's favicon.
   */
  output(context: ShadowContext): OperatorFunction<string, unknown> {
    const linkEl$: Observable<HTMLLinkElement> = ownerDocument().getValue(context).pipe(
        map(document => {
          const el: HTMLLinkElement = document.head.querySelector('link[rel="icon"]')
              || document.createElement('link');
          el.rel = 'icon';
          document.head.appendChild(el);

          return el;
        }),
        shareReplay({bufferSize: 1, refCount: true}),
    );

    return pipe(
        withLatestFrom(linkEl$),
        tap(([iconHref, linkEl]: [string, HTMLLinkElement]) => {
          linkEl.href = iconHref;
        }),
    );
  }
}

/**
 * {@inheritDoc Favicon}
 */
export function favicon(): Favicon {
  return new Favicon();
}
