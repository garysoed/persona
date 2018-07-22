import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder } from 'grapevine/export/main';
import { assert, should, wait } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType } from 'gs-types/export';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { DomListener } from './dom-listener';

describe('event.DomListener', () => {
  const EVENT_NAME = 'eventName';
  const PROPERTY_KEY = 'propertyKey';

  let mockElementLocator: jasmine.SpyObj<ResolvedWatchableLocator<HTMLElement|null>>;
  let options: jasmine.SpyObj<AddEventListenerOptions>;
  let listener: DomListener;

  beforeEach(() => {
    mockElementLocator = jasmine.createSpyObj('ElementLocator', ['getReadingId']);
    options = Mocks.object('options');
    listener = new DomListener(
        mockElementLocator,
        EVENT_NAME,
        PROPERTY_KEY,
        options);
  });

  describe('listen', () => {
    should(`listen to events correctly`, async () => {
      const el = document.createElement('div');
      const addListenerSpy = spyOn(el, 'addEventListener').and.callThrough();

      const vineBuilder = new VineBuilder();
      const sourceId = instanceSourceId('el', InstanceofType(HTMLElement));
      vineBuilder.source(sourceId, el);
      mockElementLocator.getReadingId.and.returnValue(sourceId);

      const vine = vineBuilder.run();
      const mockContext = jasmine.createSpyObj('Context', [PROPERTY_KEY]);

      const disposableFn = listener.listen(vine, mockContext);
      await wait(addListenerSpy).to.haveBeenCalled();

      const eventObj = new CustomEvent<{}>(EVENT_NAME);
      el.dispatchEvent(eventObj);

      assert(mockContext[PROPERTY_KEY]).to.haveBeenCalledWith(eventObj, vine);

      disposableFn.dispose();

      mockContext[PROPERTY_KEY].calls.reset();
      el.dispatchEvent(eventObj);
      assert(mockContext[PROPERTY_KEY]).toNot.haveBeenCalled();
    });

    should(`handle when element is removed`, async () => {
      const el = document.createElement('div');
      const addListenerSpy = spyOn(el, 'addEventListener').and.callThrough();
      const removeListenerSpy = spyOn(el, 'removeEventListener').and.callThrough();

      const vineBuilder = new VineBuilder();
      const sourceId = instanceSourceId('el', InstanceofType(HTMLElement));
      vineBuilder.source(sourceId, el);
      mockElementLocator.getReadingId.and.returnValue(sourceId);

      const vine = vineBuilder.run();
      const mockContext = jasmine.createSpyObj('Context', ['addDisposable', PROPERTY_KEY]);
      Object.setPrototypeOf(mockContext, BaseDisposable.prototype);

      listener.listen(vine, mockContext);
      await wait(addListenerSpy).to.haveBeenCalled();

      // Remove the element.
      vine.setValue(sourceId, null, mockContext);
      await wait(removeListenerSpy).to.haveBeenCalled();

      const eventObj = new CustomEvent<{}>(EVENT_NAME);
      el.dispatchEvent(eventObj);
      assert(mockContext[PROPERTY_KEY]).toNot.haveBeenCalled();
    });

    should(`throw error if property is not a function`, () => {
      const el = document.createElement('div');
      const vineBuilder = new VineBuilder();
      const sourceId = instanceSourceId('el', InstanceofType(HTMLElement));
      vineBuilder.source(sourceId, el);
      mockElementLocator.getReadingId.and.returnValue(sourceId);

      const vine = vineBuilder.run();
      const mockContext = jasmine.createSpyObj('Context', ['addDisposable', 'otherProperty']);

      assert(() => {
        listener.listen(vine, mockContext);
      }).to.throwError(/Property/);
    });
  });
});
