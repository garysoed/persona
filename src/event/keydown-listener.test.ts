import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
import { mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, fake, resetCalls, Spy, spy } from 'gs-testing/export/spy';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType } from 'gs-types/export';
import { of as observableOf } from 'rxjs';
import { element } from '../locator/element-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { KeydownListener, MatchOptions } from './keydown-listener';

const KEY = 'key';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(vine: VineImpl): any {
    // noop
  }

  method(event: KeyboardEvent, vine: VineImpl): void {
    // noop
  }
}

test('event.KeydownListener', () => {
  const ELEMENT_LOCATOR = element('div', InstanceofType(HTMLDivElement));
  let listener: KeydownListener<HTMLDivElement>;
  let matchOptions: MatchOptions;

  beforeEach(() => {
    matchOptions = {};
    listener = new KeydownListener(
        KEY,
        matchOptions,
        ELEMENT_LOCATOR,
        'method');
  });

  // TODO: Use test generator.
  test('listenImpl_', () => {
    should(`match the key correctly`, () => {
      const context = new TestClass();
      const spyMethod = spy(context, 'method');

      const el = document.createElement('div');
      const mockVine = createSpyInstance(VineImpl);
      fake(mockVine.getObservable)
          .when(ELEMENT_LOCATOR.getReadingId(), context).return(observableOf(el));

      listener.listen(mockVine, context);

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(spyMethod).to.haveBeenCalledWith(event, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spyMethod).toNot.haveBeenCalled();
    });

    should(`match the alt correctly`, () => {
      const context = new TestClass();
      const spyMethod = spy(context, 'method');

      const el = document.createElement('div');
      const mockVine = createSpyInstance(VineImpl);
      fake(mockVine.getObservable)
          .when(ELEMENT_LOCATOR.getReadingId(), context).return(observableOf(el));

      listener.listen(mockVine, context);

      // alt === true
      matchOptions.alt = true;
      resetCalls(spyMethod);
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      el.dispatchEvent(altEvent);
      assert(spyMethod).to.haveBeenCalledWith(altEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spyMethod).toNot.haveBeenCalled();

      // alt === false
      matchOptions.alt = false;
      resetCalls(spyMethod);
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonAltEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonAltEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(spyMethod).toNot.haveBeenCalled();

      // alt === null
      matchOptions.alt = undefined;
      resetCalls(spyMethod);
      el.dispatchEvent(altEvent);
      assert(spyMethod).to.haveBeenCalledWith(altEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(nonAltEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonAltEvent, mockVine);
    });

    should(`match the ctrl correctly`, () => {
      const context = new TestClass();
      const spyMethod = spy(context, 'method');

      const el = document.createElement('div');
      const mockVine = createSpyInstance(VineImpl);
      fake(mockVine.getObservable)
          .when(ELEMENT_LOCATOR.getReadingId(), context).return(observableOf(el));

      listener.listen(mockVine, context);

      // ctrl === true
      matchOptions.ctrl = true;
      resetCalls(spyMethod);
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      el.dispatchEvent(ctrlEvent);
      assert(spyMethod).to.haveBeenCalledWith(ctrlEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spyMethod).toNot.haveBeenCalled();

      // ctrl === false
      matchOptions.ctrl = false;
      resetCalls(spyMethod);
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonCtrlEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonCtrlEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(spyMethod).toNot.haveBeenCalled();

      // ctrl === null
      matchOptions.ctrl = undefined;
      resetCalls(spyMethod);
      el.dispatchEvent(ctrlEvent);
      assert(spyMethod).to.haveBeenCalledWith(ctrlEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(nonCtrlEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonCtrlEvent, mockVine);
    });

    should(`match the meta correctly`, () => {
      const context = new TestClass();
      const spyMethod = spy(context, 'method');

      const el = document.createElement('div');
      const mockVine = createSpyInstance(VineImpl);
      fake(mockVine.getObservable)
          .when(ELEMENT_LOCATOR.getReadingId(), context).return(observableOf(el));

      listener.listen(mockVine, context);

      // meta === true
      matchOptions.meta = true;
      resetCalls(spyMethod);
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      el.dispatchEvent(metaEvent);
      assert(spyMethod).to.haveBeenCalledWith(metaEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spyMethod).toNot.haveBeenCalled();

      // meta === false
      matchOptions.meta = false;
      resetCalls(spyMethod);
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonMetaEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonMetaEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(spyMethod).toNot.haveBeenCalled();

      // meta === null
      matchOptions.meta = undefined;
      resetCalls(spyMethod);
      el.dispatchEvent(metaEvent);
      assert(spyMethod).to.haveBeenCalledWith(metaEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(nonMetaEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonMetaEvent, mockVine);
    });

    should(`match the shift correctly`, () => {
      const context = new TestClass();
      const spyMethod = spy(context, 'method');

      const el = document.createElement('div');
      const mockVine = createSpyInstance(VineImpl);
      fake(mockVine.getObservable)
          .when(ELEMENT_LOCATOR.getReadingId(), context).return(observableOf(el));

      listener.listen(mockVine, context);

      // shift === true
      matchOptions.shift = true;
      resetCalls(spyMethod);
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      el.dispatchEvent(shiftEvent);
      assert(spyMethod).to.haveBeenCalledWith(shiftEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spyMethod).toNot.haveBeenCalled();

      // shift === false
      matchOptions.shift = false;
      resetCalls(spyMethod);
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonShiftEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonShiftEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(spyMethod).toNot.haveBeenCalled();

      // shift === null
      matchOptions.shift = undefined;
      resetCalls(spyMethod);
      el.dispatchEvent(shiftEvent);
      assert(spyMethod).to.haveBeenCalledWith(shiftEvent, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(nonShiftEvent);
      assert(spyMethod).to.haveBeenCalledWith(nonShiftEvent, mockVine);
    });

    should(`ignore if event is not KeyboardEvent`, () => {
      const context = new TestClass();
      const spyMethod = spy(context, 'method');

      const el = document.createElement('div');
      const mockVine = createSpyInstance(VineImpl);
      fake(mockVine.getObservable)
          .when(ELEMENT_LOCATOR.getReadingId(), context).return(observableOf(el));

      listener.listen(mockVine, context);

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(spyMethod).to.haveBeenCalledWith(event, mockVine);

      resetCalls(spyMethod);
      el.dispatchEvent(new CustomEvent<{}>('keydown'));
      assert(spyMethod).toNot.haveBeenCalled();
    });
  });
});
