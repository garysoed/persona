import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';

export type Handler<T> = (newValue: T) => void;

export abstract class Watcher<T> {
  private readonly handlers_: Map<ShadowRoot, Set<Handler<T>>> = new Map();
  private readonly unwatch_: Map<ShadowRoot, DisposableFunction> = new Map();

  abstract getValue_(root: ShadowRoot): T;

  protected abstract startWatching_(vineImpl: VineImpl, onChange: Handler<T>, root: ShadowRoot):
      DisposableFunction;

  watch(vineImpl: VineImpl, onChange: Handler<T>, root: ShadowRoot): DisposableFunction {
    const handlers = this.handlers_.get(root) || new Set();
    handlers.add(onChange);
    this.handlers_.set(root, handlers);

    if (!this.unwatch_.has(root)) {
      const unwatchFn = this.startWatching_(vineImpl, (newValue: T) => {
        for (const handler of handlers) {
          handler(newValue);
        }
      }, root);
      this.unwatch_.set(root, unwatchFn);
    }

    onChange(this.getValue_(root));

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
