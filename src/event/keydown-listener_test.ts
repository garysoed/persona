import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, resetCalls, Spy } from 'gs-testing/export/spy';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType } from 'gs-types/export';
import { element } from '../locator/element-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { KeydownListener, MatchOptions } from './keydown-listener';

const KEY = 'key';

describe('event.KeydownListener', () => {
  const ELEMENT_LOCATOR = element('div', InstanceofType(HTMLDivElement));
  let listener: KeydownListener<HTMLDivElement>;
  let matchOptions: MatchOptions;

  beforeEach(() => {
    matchOptions = {};
    listener = new KeydownListener(
        KEY,
        matchOptions,
        ELEMENT_LOCATOR,
        'propertyKey');
  });

  // TODO: Use test generator.
  describe('listenImpl_', () => {
    should(`match the key correctly`, () => {
      const mockVine = createSpyInstance(VineImpl);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);

      const callbackMatcher = match.anyThat<any>().beAFunction();
      assert(
          mockVine.listen as any as Spy<(
              handler: (value: HTMLDivElement) => void,
              context: BaseDisposable,
              nodeId: InstanceSourceId<HTMLDivElement>) => (() => void)>).to.haveBeenCalledWith(
          callbackMatcher, context, ELEMENT_LOCATOR.getReadingId());
      callbackMatcher.getLastMatch()(el);

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(mockHandler).to.haveBeenCalledWith(event);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the alt correctly`, () => {
      const mockVine = createSpyInstance(VineImpl);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      const callbackMatcher = match.anyThat<any>().beAFunction();
      assert(
          mockVine.listen as any as Spy<(
              handler: (value: HTMLDivElement) => void,
              context: BaseDisposable,
              nodeId: InstanceSourceId<HTMLDivElement>) => (() => void)>).to.haveBeenCalledWith(
          callbackMatcher, context, ELEMENT_LOCATOR.getReadingId());
      callbackMatcher.getLastMatch()(el);

      matchOptions.alt = true;
      resetCalls(mockHandler);
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      el.dispatchEvent(altEvent);
      assert(mockHandler).to.haveBeenCalledWith(altEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.alt = false;
      resetCalls(mockHandler);
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonAltEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonAltEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the ctrl correctly`, () => {
      const mockVine = createSpyInstance(VineImpl);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      const callbackMatcher = match.anyThat<any>().beAFunction();
      assert(
          mockVine.listen as any as Spy<(
              handler: (value: HTMLDivElement) => void,
              context: BaseDisposable,
              nodeId: InstanceSourceId<HTMLDivElement>) => (() => void)>).to.haveBeenCalledWith(
          callbackMatcher, context, ELEMENT_LOCATOR.getReadingId());
      callbackMatcher.getLastMatch()(el);

      matchOptions.ctrl = true;
      resetCalls(mockHandler);
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      el.dispatchEvent(ctrlEvent);
      assert(mockHandler).to.haveBeenCalledWith(ctrlEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.ctrl = false;
      resetCalls(mockHandler);
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonCtrlEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonCtrlEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the meta correctly`, () => {
      const mockVine = createSpyInstance(VineImpl);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      const callbackMatcher = match.anyThat<any>().beAFunction();
      assert(
          mockVine.listen as any as Spy<(
              handler: (value: HTMLDivElement) => void,
              context: BaseDisposable,
              nodeId: InstanceSourceId<HTMLDivElement>) => (() => void)>).to.haveBeenCalledWith(
          callbackMatcher, context, ELEMENT_LOCATOR.getReadingId());
      callbackMatcher.getLastMatch()(el);

      matchOptions.meta = true;
      resetCalls(mockHandler);
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      el.dispatchEvent(metaEvent);
      assert(mockHandler).to.haveBeenCalledWith(metaEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.meta = false;
      resetCalls(mockHandler);
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonMetaEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonMetaEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the shift correctly`, () => {
      const mockVine = createSpyInstance(VineImpl);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      const callbackMatcher = match.anyThat<any>().beAFunction();
      assert(
          mockVine.listen as any as Spy<(
              handler: (value: HTMLDivElement) => void,
              context: BaseDisposable,
              nodeId: InstanceSourceId<HTMLDivElement>) => (() => void)>).to.haveBeenCalledWith(
          callbackMatcher, context, ELEMENT_LOCATOR.getReadingId());
      callbackMatcher.getLastMatch()(el);

      matchOptions.shift = true;
      resetCalls(mockHandler);
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      el.dispatchEvent(shiftEvent);
      assert(mockHandler).to.haveBeenCalledWith(shiftEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.shift = false;
      resetCalls(mockHandler);
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonShiftEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonShiftEvent);

      resetCalls(mockHandler);
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`ignore if event is not KeyboardEvent`, () => {
      const mockVine = createSpyInstance(VineImpl);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      const callbackMatcher = match.anyThat<any>().beAFunction();
      assert(
          mockVine.listen as any as Spy<(
              handler: (value: HTMLDivElement) => void,
              context: BaseDisposable,
              nodeId: InstanceSourceId<HTMLDivElement>) => (() => void)>).to.haveBeenCalledWith(
          callbackMatcher, context, ELEMENT_LOCATOR.getReadingId());
      callbackMatcher.getLastMatch()(el);

      el.dispatchEvent(new CustomEvent<{}>('keydown'));
      assert(mockHandler).toNot.haveBeenCalled();
    });
  });
});
