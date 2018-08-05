import { VineImpl } from 'grapevine/export/main';
import { assert, fshould, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, fake, Spy, SpyObj } from 'gs-testing/export/spy';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { ChainedWatcher } from './chained-watcher';
import { Handler, Watcher } from './watcher';

describe('watcher.ChainedWatcher', () => {
  let mockSourceWatcher: SpyObj<Watcher<string>>;
  let mockStartWatchFn: Spy;
  let watcher: ChainedWatcher<string, number>;

  beforeEach(() => {
    mockSourceWatcher = createSpyInstance('SourceWatcher', Watcher.prototype);
    mockStartWatchFn = createSpy('StartWatchFn');
    watcher = new ChainedWatcher(mockSourceWatcher, mockStartWatchFn);
  });

  describe('startWatching_', () => {
    should(`call the startWatchFn correctly`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const onChange = Mocks.object<Handler<number>>('onChange');
      const root = Mocks.object<ShadowRoot>('root');
      const source = 'source';

      const mockSourceUnlisten = createSpyInstance('SourceUnlisten', DisposableFunction.prototype);
      fake(mockSourceWatcher.watch).always().return(mockSourceUnlisten);

      const mockInnerUnlisten = createSpyInstance('InnerUnlisten', DisposableFunction.prototype);
      const unlisten = {key: '123', unlisten: mockInnerUnlisten};
      fake(mockStartWatchFn).always().return(unlisten);

      const unwatch = watcher['startWatching_'](vine, onChange, root);

      const functionMatcher = match.anyThat<Handler<string>>().beAFunction();
      assert(mockSourceWatcher.watch).to
          .haveBeenCalledWith(vine, functionMatcher, root);

      const handler = functionMatcher.getLastMatch();
      handler(source);
      assert(mockStartWatchFn).to.haveBeenCalledWith(source, null, vine, onChange, root);

      handler(source);
      assert(mockStartWatchFn).to.haveBeenCalledWith(source, unlisten, vine, onChange, root);

      unwatch.dispose();
      assert(mockSourceUnlisten.dispose).to.haveBeenCalledWith();
      assert(mockInnerUnlisten.dispose).to.haveBeenCalledWith();
    });

    should(`not throw error if startWatchFn doesn't return any unlistens`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const onChange = Mocks.object<Handler<number>>('onChange');
      const root = Mocks.object<ShadowRoot>('root');

      const mockSourceUnlisten = createSpyInstance('SourceUnlisten', DisposableFunction.prototype);
      fake(mockSourceWatcher.watch).always().return(mockSourceUnlisten);
      fake(mockStartWatchFn).always().return(null);

      const unwatch = watcher['startWatching_'](vine, onChange, root);
      unwatch.dispose();
      assert(mockSourceUnlisten.dispose).to.haveBeenCalledWith();
    });
  });
});
