import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';

/**
 * Provides a hook / bridge to a place in the DOM.
 */
export abstract class Hook<T> {
  constructor(protected readonly vine_: VineImpl) { }

  abstract install(root: ShadowRoot, component: BaseDisposable): void;
}
