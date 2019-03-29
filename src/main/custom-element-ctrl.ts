import { VineImpl } from '@grapevine/main';
import { BaseDisposable } from '@gs-tools/dispose';

/**
 * Base class of all custom elements.
 */
export abstract class CustomElementCtrl extends BaseDisposable {
  init(vine: VineImpl): any {
    // Noop
  }
}
