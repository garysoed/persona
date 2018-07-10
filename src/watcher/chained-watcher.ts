import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Handler, Watcher } from './watcher';

export interface Unlisten {
  key: {};
  unlisten: DisposableFunction;
}
export type StartWatchFn<T1, T2> = (
    src: T1,
    prevUnlisten: Unlisten|null,
    vineImpl: VineImpl,
    onChange: Handler<T2>,
    root: ShadowRoot) => Unlisten|null;

export class ChainedWatcher<T1, T2> extends Watcher<T2> {
  constructor(
      private readonly sourceWatcher_: Watcher<T1>,
      private readonly startWatchFn_: StartWatchFn<T1, T2>) {
    super();
  }

  protected startWatching_(vineImpl: VineImpl, onChange: Handler<T2>, root: ShadowRoot):
      DisposableFunction {
    let innerUnlisten: Unlisten|null = null;
    const sourceUnlisten = this.sourceWatcher_.watch(
        vineImpl,
        source => {
          innerUnlisten = this.startWatchFn_(source, innerUnlisten, vineImpl, onChange, root);
        },
        root);

    return DisposableFunction.of(() => {
      if (innerUnlisten) {
        innerUnlisten.unlisten.dispose();
      }
      sourceUnlisten.dispose();
    });
  }
}
