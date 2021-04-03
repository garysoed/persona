import {Observable, of as observableOf} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';

/**
 * Inputs the owner document of the context.
 */
export class OwnerDocumentInput implements Input<Document> {
  /**
   * Emits the owner document in the context.
   *
   * @param context - Context whose owner document will be emitted.
   * @returns Observable that emits the owner document in the given context.
   */
  getValue(context: ShadowContext): Observable<Document> {
    return observableOf(context.shadowRoot.ownerDocument);
  }
}

/**
 * {@inheritDoc OwnerDocumentInput}
 */
export function ownerDocument(): OwnerDocumentInput {
  return new OwnerDocumentInput();
}
