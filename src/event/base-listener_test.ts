import { VineImpl } from 'grapevine/export/main';
import { assert, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, Spy } from 'gs-testing/export/spy';
import { createSpyInstance, createSpyObject, spy } from 'gs-testing/src/spy/spy';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { BaseListener } from './base-listener';

const PROPERTY_KEY = 'method';

/**
 * @test
 */
class TestListener extends BaseListener {
  constructor(private readonly listenImplSpy_: Spy<DisposableFunction>) {
    super(PROPERTY_KEY);
  }

  protected listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl,
      handler: EventListener): DisposableFunction {
    return this.listenImplSpy_(vine, context, handler);
  }
}

/**
 * @test
 */
class TestCtrl extends CustomElementCtrl {
  [PROPERTY_KEY](event: CustomEvent, vine: VineImpl): void {
    // noop
  }

  init(vine: VineImpl): void {
    // Noop
  }
}

describe('event.BaseListener', () => {
  let mockListenImplSpy: Spy<DisposableFunction>;
  let listener: TestListener;

  beforeEach(() => {
    mockListenImplSpy = createSpy<DisposableFunction>('ListenImplSpy');
    listener = new TestListener(mockListenImplSpy);
  });

  describe('listen', () => {
    should(`call listenImpl correctly`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const mockContext = new TestCtrl();
      const propertySpy = spy(mockContext, PROPERTY_KEY);

      listener.listen(vine, mockContext);
      const handlerMatch = match.anyThat<(event: Event) => void>().beAFunction();
      assert(mockListenImplSpy).to
          .haveBeenCalledWith(vine, mockContext, handlerMatch);

      const event = Mocks.object<CustomEvent>('event');
      handlerMatch.getLastMatch()(event);
      assert(propertySpy).to.haveBeenCalledWith(event, vine);
    });

    should(`throw error if property is not a function`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const mockContext = createSpyInstance('CustomElementCtrl', CustomElementCtrl.prototype);
      assert(() => {
        listener.listen(vine, mockContext);
      }).to.throwErrorWithMessage(/Property/);
    });
  });
});
