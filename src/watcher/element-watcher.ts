import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Handler, Watcher } from './watcher';

/**
 * Exposes HTMLElement in DOM to Typescript.
 */
export class ElementWatcher<T extends HTMLElement|null> extends Watcher<T> {
  constructor(
      private readonly valueProvider_: (root: ShadowRoot) => T) {
    super();
  }

  getValue_(root: ShadowRoot): T {
    return this.valueProvider_(root);
  }

  protected startWatching_(
      _vineImpl: VineImpl,
      onChange: Handler<T>,
      root: ShadowRoot): DisposableFunction {
    const mutationObserver = new MutationObserver(records => {
      if (records.length > 0) {
        onChange(this.valueProvider_(root));
      }
    });
    mutationObserver.observe(root, {childList: true, subtree: true});
    onChange(this.valueProvider_(root));

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
    });
  }
}
