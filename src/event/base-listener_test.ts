import { VineImpl } from 'grapevine/export/main';
import { assert, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, fake, Spy } from 'gs-testing/export/spy';
import { createSpyInstance, spy } from 'gs-testing/src/spy/spy';
import { Observable, of as observableOf } from 'rxjs';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { BaseListener } from './base-listener';

const PROPERTY_KEY = 'method';

/**
 * @test
 */
class TestListener extends BaseListener {
  constructor(
      private readonly listenImplSpy_: Spy<Observable<Event>, [VineImpl, CustomElementCtrl]>) {
    super(PROPERTY_KEY);
  }

  protected listenImpl_(
      vine: VineImpl,
      context: CustomElementCtrl): Observable<Event> {
    return this.listenImplSpy_(vine, context);
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
  let mockListenImplSpy: Spy<Observable<Event>, [VineImpl, CustomElementCtrl]>;
  let listener: TestListener;

  beforeEach(() => {
    mockListenImplSpy = createSpy<Observable<Event>, [VineImpl, CustomElementCtrl]>(
        'ListenImplSpy');
    listener = new TestListener(mockListenImplSpy);
  });

  describe('listen', () => {
    should(`call listenImpl correctly`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const mockContext = new TestCtrl();
      const propertySpy = spy(mockContext, PROPERTY_KEY);

      const event = Mocks.object<CustomEvent>('event');
      fake(mockListenImplSpy).always().return(observableOf(event));

      listener.listen(vine, mockContext);
      assert(propertySpy).to.haveBeenCalledWith(event, vine);
    });

    should(`throw error if property is not a function`, () => {
      const vine = Mocks.object<VineImpl>('vine');
      const mockContext = createSpyInstance(CustomElementCtrl);
      assert(() => {
        listener.listen(vine, mockContext);
      }).to.throwErrorWithMessage(/Property/);
    });
  });
});
