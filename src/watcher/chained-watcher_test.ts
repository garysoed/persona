import { VineImpl } from 'grapevine/export/main';
import { assert, Match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { ChainedWatcher } from './chained-watcher';
import { Handler, Watcher } from './watcher';

describe('watcher.ChainedWatcher', () => {
  let mockSourceWatcher: jasmine.SpyObj<Watcher<string>>;
  let mockStartWatchFn: jasmine.Spy;
  let watcher: ChainedWatcher<string, number>;

  beforeEach(() => {
    mockSourceWatcher = jasmine.createSpyObj('SourceWatcher', ['watch']);
    mockStartWatchFn = jasmine.createSpy('StartWatchFn');
    watcher = new ChainedWatcher(mockSourceWatcher, mockStartWatchFn);
  });

  describe('startWatching_', () => {
    should(`call the startWatchFn correctly`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const onChange = Mocks.object<Handler<number>>('onChange');
      const root = Mocks.object<ShadowRoot>('root');
      const source = 'source';

      const mockSourceUnlisten = jasmine.createSpyObj('SourceUnlisten', ['dispose']);
      mockSourceWatcher.watch.and.returnValue(mockSourceUnlisten);

      const mockInnerUnlisten = jasmine.createSpyObj('InnerUnlisten', ['dispose']);
      const unlisten = {key: '123', unlisten: mockInnerUnlisten};
      mockStartWatchFn.and.returnValue(unlisten);

      const unwatch = watcher['startWatching_'](vine, onChange, root);
      assert(mockSourceWatcher.watch).to.haveBeenCalledWith(vine, Match.anyFunction(), root);

      const handler = mockSourceWatcher.watch.calls.argsFor(0)[1];
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

      const mockSourceUnlisten = jasmine.createSpyObj('SourceUnlisten', ['dispose']);
      mockSourceWatcher.watch.and.returnValue(mockSourceUnlisten);
      mockStartWatchFn.and.returnValue(null);

      const unwatch = watcher['startWatching_'](vine, onChange, root);
      unwatch.dispose();
      assert(mockSourceUnlisten.dispose).to.haveBeenCalledWith();
    });
  });
});
