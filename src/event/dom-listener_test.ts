import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { assert, match, retryUntil, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpyInstance, fake, resetCalls, spy, SpyObj } from 'gs-testing/export/spy';
import { InstanceofType } from 'gs-types/export';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { DomListener } from './dom-listener';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(vine: VineImpl): any {
    // noop
  }

  method(event: CustomEvent, vine: VineImpl): void {
    // noop
  }
}

describe('event.DomListener', () => {
  const EVENT_NAME = 'eventName';

  let mockElementLocator: SpyObj<ResolvedWatchableLocator<HTMLElement>>;
  let options: SpyObj<AddEventListenerOptions>;
  let listener: DomListener;

  beforeEach(() => {
    mockElementLocator = createSpyInstance<ResolvedWatchableLocator<HTMLElement>>(
        ResolvedWatchableLocator,
        [],
        'ElementLocator',
    );
    options = Mocks.object('options');
    listener = new DomListener(
        mockElementLocator,
        EVENT_NAME,
        'method',
        options);
  });

  describe('listen', () => {
    should(`listen to events correctly`, async () => {
      const el = document.createElement('div');
      const addListenerSpy = fake(spy(el, 'addEventListener')).always().callOriginal();

      const vineBuilder = new VineBuilder();
      const sourceId = instanceSourceId('el', InstanceofType(HTMLElement));
      vineBuilder.source(sourceId, el);
      fake(mockElementLocator.getReadingId).always().return(sourceId);

      const vine = vineBuilder.run();
      const mockContext = new TestClass();
      const spyMethod = spy(mockContext, 'method');

      const disposableFn = listener.listen(vine, mockContext);
      await retryUntil(() => addListenerSpy).to.equal(match.anySpyThat().haveBeenCalled());

      const eventObj = new CustomEvent<{}>(EVENT_NAME);
      el.dispatchEvent(eventObj);

      assert(spyMethod).to.haveBeenCalledWith(eventObj, vine);

      disposableFn.dispose();

      resetCalls(spyMethod);
      el.dispatchEvent(eventObj);
      assert(spyMethod).toNot.haveBeenCalled();
    });

    should(`handle when element is removed`, async () => {
      const el = document.createElement('div');
      const addListenerSpy = fake(spy(el, 'addEventListener')).always().callOriginal();
      const removeListenerSpy = fake(spy(el, 'removeEventListener')).always().callOriginal();

      const vineBuilder = new VineBuilder();
      const sourceId = instanceSourceId('el', InstanceofType(HTMLElement));
      vineBuilder.source(sourceId, el);
      fake(mockElementLocator.getReadingId).always().return(sourceId);

      const vine = vineBuilder.run();
      const mockContext = new TestClass();
      const spyMethod = spy(mockContext, 'method');

      listener.listen(vine, mockContext);
      await retryUntil(() => addListenerSpy).to.equal(match.anySpyThat().haveBeenCalled());

      // Remove the element.
      vine.setValue(sourceId, null, mockContext);
      await retryUntil(() => removeListenerSpy).to.equal(match.anySpyThat().haveBeenCalled());

      const eventObj = new CustomEvent<{}>(EVENT_NAME);
      el.dispatchEvent(eventObj);
      assert(spyMethod).toNot.haveBeenCalled();
    });

    should(`throw error if property is not a function`, () => {
      const el = document.createElement('div');
      const vineBuilder = new VineBuilder();
      const sourceId = instanceSourceId('el', InstanceofType(HTMLElement));
      vineBuilder.source(sourceId, el);
      fake(mockElementLocator.getReadingId).always().return(sourceId);

      const vine = vineBuilder.run();
      const mockContext = createSpyInstance(CustomElementCtrl);

      assert(() => {
        listener.listen(vine, mockContext);
      }).to.throwErrorWithMessage(/Property/);
    });
  });
});
