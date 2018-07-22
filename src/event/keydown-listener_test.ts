import { assert, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { InstanceofType } from 'gs-types/export';
import { element } from '../locator/element-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { KeydownListener, MatchOptions } from './keydown-listener';

const KEY = 'key';

describe('event.KeydownListener', () => {
  let listener: KeydownListener<HTMLDivElement>;
  let matchOptions: MatchOptions;

  beforeEach(() => {
    matchOptions = {};
    listener = new KeydownListener(
        KEY,
        matchOptions,
        element('div', InstanceofType(HTMLDivElement)),
        'propertyKey');
  });

  // TODO: Use test generator.
  describe('listenImpl_', () => {
    should(`match the key correctly`, () => {
      const mockVine = jasmine.createSpyObj('Vine', ['listen']);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = jasmine.createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      mockVine.listen.calls.argsFor(0)[0](el);

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(mockHandler).to.haveBeenCalledWith(event);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the alt correctly`, () => {
      const mockVine = jasmine.createSpyObj('Vine', ['listen']);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = jasmine.createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      mockVine.listen.calls.argsFor(0)[0](el);

      matchOptions.alt = true;
      mockHandler.calls.reset();
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      el.dispatchEvent(altEvent);
      assert(mockHandler).to.haveBeenCalledWith(altEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.alt = false;
      mockHandler.calls.reset();
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonAltEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonAltEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the ctrl correctly`, () => {
      const mockVine = jasmine.createSpyObj('Vine', ['listen']);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = jasmine.createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      mockVine.listen.calls.argsFor(0)[0](el);

      matchOptions.ctrl = true;
      mockHandler.calls.reset();
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      el.dispatchEvent(ctrlEvent);
      assert(mockHandler).to.haveBeenCalledWith(ctrlEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.ctrl = false;
      mockHandler.calls.reset();
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonCtrlEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonCtrlEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the meta correctly`, () => {
      const mockVine = jasmine.createSpyObj('Vine', ['listen']);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = jasmine.createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      mockVine.listen.calls.argsFor(0)[0](el);

      matchOptions.meta = true;
      mockHandler.calls.reset();
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      el.dispatchEvent(metaEvent);
      assert(mockHandler).to.haveBeenCalledWith(metaEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.meta = false;
      mockHandler.calls.reset();
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonMetaEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonMetaEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`match the shift correctly`, () => {
      const mockVine = jasmine.createSpyObj('Vine', ['listen']);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = jasmine.createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      mockVine.listen.calls.argsFor(0)[0](el);

      matchOptions.shift = true;
      mockHandler.calls.reset();
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      el.dispatchEvent(shiftEvent);
      assert(mockHandler).to.haveBeenCalledWith(shiftEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(mockHandler).toNot.haveBeenCalled();

      matchOptions.shift = false;
      mockHandler.calls.reset();
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonShiftEvent);
      assert(mockHandler).to.haveBeenCalledWith(nonShiftEvent);

      mockHandler.calls.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(mockHandler).toNot.haveBeenCalled();
    });

    should(`ignore if event is not KeyboardEvent`, () => {
      const mockVine = jasmine.createSpyObj('Vine', ['listen']);
      const context = Mocks.object<CustomElementCtrl>('context');
      const mockHandler = jasmine.createSpy('Handler');

      const el = document.createElement('div');

      listener['listenImpl_'](mockVine, context, mockHandler);
      mockVine.listen.calls.argsFor(0)[0](el);

      el.dispatchEvent(new CustomEvent('keydown'));
      assert(mockHandler).toNot.haveBeenCalled();
    });
  });
});
