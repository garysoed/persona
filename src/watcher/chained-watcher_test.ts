import { VineImpl } from 'grapevine/export/main';
import { assert, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, fake, resetCalls, Spy, SpyObj } from 'gs-testing/export/spy';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { ChainedWatcher, Unlisten } from './chained-watcher';
import { Handler, Watcher } from './watcher';

describe('watcher.ChainedWatcher', () => {
  let mockSourceWatcher: SpyObj<Watcher<string>>;
  let mockStartWatchFn: Spy<Unlisten>;
  let mockMapFn: Spy<number, [string]>;
  let watcher: ChainedWatcher<string, number>;

  beforeEach(() => {
    mockSourceWatcher = createSpyInstance('SourceWatcher', Watcher.prototype, ['getValue']);
    mockStartWatchFn = createSpy('StartWatchFn');
    mockMapFn = createSpy<number, [string]>('MapFn');
    watcher = new ChainedWatcher(mockSourceWatcher, mockStartWatchFn, mockMapFn);
  });

  describe('getValue_', () => {
    should(`return the correct value`, () => {
      const root = Mocks.object<ShadowRoot>('root');
      const value = 123;
      fake(mockMapFn).always().return(value);

      const sourceValue = '456';
      fake(mockSourceWatcher.getValue).always().return(sourceValue);

      assert(watcher.getValue(root)).to.equal(value);
      assert(mockMapFn).to.haveBeenCalledWith(sourceValue);
      assert(mockSourceWatcher.getValue).to.haveBeenCalledWith(root);
    });
  });

  describe('startWatching_', () => {
    should(`call the startWatchFn correctly`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const onChange = Mocks.object<Handler>('onChange');
      const root = Mocks.object<ShadowRoot>('root');
      const source = 'source';

      const mockSourceUnlisten = createSpyInstance('SourceUnlisten', DisposableFunction.prototype);
      fake(mockSourceWatcher.watch).always().return(mockSourceUnlisten);
      fake(mockSourceWatcher.getValue).always().return(source);

      const mockInnerUnlisten = createSpyInstance('InnerUnlisten', DisposableFunction.prototype);
      const unlisten = {key: '123', unlisten: mockInnerUnlisten};
      fake(mockStartWatchFn).always().return(unlisten);

      const unwatch = watcher['startWatching_'](vine, onChange, root);

      const functionMatcher = match.anyThat<Handler>().beAFunction();
      assert(mockSourceWatcher.watch).to
          .haveBeenCalledWith(vine, functionMatcher, root);

      const handler = functionMatcher.getLastMatch();
      handler(root);
      assert(mockStartWatchFn).to.haveBeenCalledWith(source, null, vine, onChange, root);
      assert(mockSourceWatcher.getValue).to.haveBeenCalledWith(root);

      resetCalls(mockSourceWatcher.getValue);

      handler(root);
      assert(mockStartWatchFn).to.haveBeenCalledWith(source, unlisten, vine, onChange, root);
      assert(mockSourceWatcher.getValue).to.haveBeenCalledWith(root);

      unwatch.dispose();
      assert(mockSourceUnlisten.dispose).to.haveBeenCalledWith();
      assert(mockInnerUnlisten.dispose).to.haveBeenCalledWith();
    });

    should(`not throw error if startWatchFn doesn't return any unlistens`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const onChange = Mocks.object<Handler>('onChange');
      const root = Mocks.object<ShadowRoot>('root');

      const mockSourceUnlisten = createSpyInstance('SourceUnlisten', DisposableFunction.prototype);
      fake(mockSourceWatcher.watch).always().return(mockSourceUnlisten);
      fake(mockStartWatchFn).always()
          .return({key: 'key', unlisten: DisposableFunction.of(() => undefined)});

      const unwatch = watcher['startWatching_'](vine, onChange, root);
      unwatch.dispose();
      assert(mockSourceUnlisten.dispose).to.haveBeenCalledWith();
    });
  });
});
