import { BaseDisposable } from '@gs-tools/dispose';
import { InitFn } from './types';

/**
 * Base class of all custom elements.
 */
export abstract class CustomElementCtrl extends BaseDisposable {
  constructor(readonly shadowRoot: ShadowRoot) {
    super();
  }

  abstract getInitFunctions(): InitFn[];
}
