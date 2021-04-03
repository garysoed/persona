import {OperatorFunction, pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {ownerDocument} from '../input/owner-document';
import {Output} from '../types/output';


/**
 * Sets the title of the owner document of the context.
 */
export class Title implements Output<string> {
  readonly type = 'out';

  /**
   * Sets the title of the owner document in the context.
   *
   * @param context - Context whose owner document's title should be set.
   * @returns Operator that takes in the title and sets the owner document's title.
   */
  output(context: ShadowContext): OperatorFunction<string, unknown> {
    return pipe(
        withLatestFrom(ownerDocument().getValue(context)),
        tap(([title, ownerDocument]) => {
          ownerDocument.title = title;
        }),
    );
  }
}

/**
 * {@inheritDoc Title}
 */
export function title(): Title {
  return new Title();
}
