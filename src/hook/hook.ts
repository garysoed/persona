import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';

/**
 * Exposes the value in the DOM to Typescript.
 */
export abstract class Hook {
  constructor(protected readonly vine_: VineImpl) { }

  abstract install(root: ShadowRoot, component: BaseDisposable): void;
}
