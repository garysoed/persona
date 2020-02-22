import { BaseDisposable } from 'gs-tools/export/dispose';

import { InitFn } from './init-fn';

export type CustomElementCtrlCtor = new (root: ShadowRoot) => CustomElementCtrl;

/**
 * Base class of all custom elements.
 */
export abstract class CustomElementCtrl extends BaseDisposable {
  constructor(readonly shadowRoot: ShadowRoot) {
    super();
  }

  abstract getInitFunctions(): readonly InitFn[];
}
