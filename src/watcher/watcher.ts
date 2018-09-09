import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';

export type Handler = (root: ShadowRoot) => void;

export abstract class Watcher<T> {
  private readonly handlers_: Map<ShadowRoot, Set<Handler>> = new Map();
  private readonly unwatch_: Map<ShadowRoot, DisposableFunction> = new Map();

  abstract getValue(root: ShadowRoot): T;

  protected abstract startWatching_(vineImpl: VineImpl, onChange: Handler, root: ShadowRoot):
      DisposableFunction;

  watch(vineImpl: VineImpl, onChange: Handler, root: ShadowRoot): DisposableFunction {
    const handlers = this.handlers_.get(root) || new Set();
    handlers.add(onChange);
    this.handlers_.set(root, handlers);

    if (!this.unwatch_.has(root)) {
      const unwatchFn = this.startWatching_(vineImpl, () => {
        for (const handler of handlers) {
          handler(root);
        }
      }, root);
      this.unwatch_.set(root, unwatchFn);
    }

    onChange(root);

    return DisposableFunction.of(() => {
      handlers.delete(onChange);
      const unwatchFn = this.unwatch_.get(root);
      if (handlers.size <= 0 && unwatchFn) {
        unwatchFn.dispose();
        this.unwatch_.delete(root);
      }
    });
  }
}
