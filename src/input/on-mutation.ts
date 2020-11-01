import { Observable } from 'rxjs';

import { Input } from '../types/input';
import { PersonaContext } from '../core/persona-context';
import { Resolver } from '../types/resolver';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';
import { mutationObservable } from '../util/mutation-observable';


/**
 * Observes mutations on the element.
 *
 * @thHidden
 */
export class OnMutationInput implements Input<readonly MutationRecord[]> {
  /**
   * @internal
   */
  constructor(
      private readonly config: MutationObserverInit,
      readonly resolver: Resolver<Element>,
  ) { }

  /**
   * @internal
   */
  getValue(context: PersonaContext): Observable<readonly MutationRecord[]> {
    const el = this.resolver(context);
    return mutationObservable(el, this.config);
  }
}

/**
 * Observes mutations on the element. Returns {@link OnMutationInput} when resolved.
 *
 * @thHidden
 */
export class UnresolvedOnMutationInput implements
    UnresolvedElementProperty<Element, OnMutationInput> {
  /**
   * @internal
   */
  constructor(
      private readonly config: MutationObserverInit,
  ) { }

  /**
   * @internal
   */
  resolve(resolver: Resolver<Element>): OnMutationInput {
    return new OnMutationInput(this.config, resolver);
  }
}

/**
 * Observes mutations on the element.
 *
 * @param config - Configuration for the mutation observer.
 * @returns Input that emits mutation records.
 * @thModule input
 */
export function onMutation(
    config: MutationObserverInit,
): UnresolvedOnMutationInput {
  return new UnresolvedOnMutationInput(config);
}
