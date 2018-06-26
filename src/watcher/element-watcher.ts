import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Watcher } from './watcher';

/**
 * Exposes HTMLElement in DOM to Typescript.
 */
export class ElementWatcher<T extends HTMLElement|null> extends Watcher<T> {
  constructor(
      private readonly valueProvider_: (root: ShadowRoot) => T,
      sourceId: InstanceSourceId<T>,
      vine: VineImpl) {
    super(sourceId, vine);
  }

  private updateVine_(root: ShadowRoot, context: BaseDisposable): void {
    this.vine_.setValue(this.sourceId_, this.valueProvider_(root), context);
  }

  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    const mutationObserver = new MutationObserver(records => {
      if (records.length > 0) {
        this.updateVine_(root, context);
      }
    });
    mutationObserver.observe(root, {childList: true, subtree: true});
    this.updateVine_(root, context);

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
    });
  }
}
