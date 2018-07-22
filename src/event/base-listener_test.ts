import { VineImpl } from 'grapevine/export/main';
import { assert, Match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { BaseListener } from './base-listener';

const PROPERTY_KEY = 'propertyKey';

/**
 * @test
 */
class TestListener extends BaseListener {
  constructor(private readonly listenImplSpy_: jasmine.Spy) {
    super(PROPERTY_KEY);
  }

  protected listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl,
      handler: EventListener): DisposableFunction {
    return this.listenImplSpy_(vine, context, handler);
  }
}

describe('event.BaseListener', () => {
  let mockListenImplSpy: jasmine.Spy;
  let listener: TestListener;

  beforeEach(() => {
    mockListenImplSpy = jasmine.createSpy('ListenImplSpy');
    listener = new TestListener(mockListenImplSpy);
  });

  describe('listen', () => {
    should(`call listenImpl correctly`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const mockContext = jasmine.createSpyObj('Context', [PROPERTY_KEY]);

      listener.listen(vine, mockContext);
      assert(mockListenImplSpy).to.haveBeenCalledWith(vine, mockContext, Match.anyFunction());

      const event = Mocks.object('event');
      mockListenImplSpy.calls.argsFor(0)[2](event);
      assert(mockContext[PROPERTY_KEY]).to.haveBeenCalledWith(event, vine);
    });

    should(`throw error if property is not a function`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const mockContext = jasmine.createSpyObj('Context', ['otherProperty']);
      assert(() => {
        listener.listen(vine, mockContext);
      }).to.throwError(/Property/);
    });
  });
});