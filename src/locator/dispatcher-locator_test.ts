import { VineImpl } from 'grapevine/export/main';
import { assert, fshould, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, createSpyObject } from 'gs-testing/export/spy';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { InstanceofType, NullableType } from 'gs-types/export';
import { ResolvedDispatcherLocator, startWatch_ } from './dispatcher-locator';
import { element } from './element-locator';

const CUSTOM_EVENT_NAME = 'test';

/**
 * @test
 */
class TestCustomEvent extends CustomEvent<string> {
  constructor() {
    super(CUSTOM_EVENT_NAME);
  }
}

describe('locator.dispatcher', () => {
  let locator: ResolvedDispatcherLocator<CustomEvent, HTMLDivElement>;

  beforeEach(() => {
    locator = new ResolvedDispatcherLocator(
        element('div', NullableType(InstanceofType(HTMLDivElement))));
  });

  describe('startWatch_', () => {
    should(`call onChange and return the correct unlisten if element exists`, () => {
      const el = document.createElement('div');
      const mockListener = createSpy('Listener');
      el.addEventListener(CUSTOM_EVENT_NAME, mockListener);

      const mockOnChange = createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = startWatch_(el, null, mockOnChange)!;

      assert(unlisten.key).to.equal(el);

      const dispatcherMatcher = match.anyThat<(event: TestCustomEvent) => void>().beAFunction();
      assert(mockOnChange).to.haveBeenCalledWith(dispatcherMatcher);
      const dispatchFn = dispatcherMatcher.getLastMatch();

      const event = new TestCustomEvent();
      dispatchFn(event);
      assert(mockListener).to.haveBeenCalledWith(event);
    });

    should(`call onChange and return null if element doesn't exist`, () => {
      const mockOnChange = createSpy('OnChange');

      const unlisten = startWatch_(null, null, mockOnChange);

      assert(unlisten).to.beNull();
      assert(mockOnChange).to.haveBeenCalledWith(null);
    });

    should(`dispose the previous unlisten if exist`, () => {
      const el = document.createElement('div');
      const mockListener = createSpy('Listener');
      el.addEventListener(CUSTOM_EVENT_NAME, mockListener);

      const mockOnChange = createSpy('OnChange');
      const mockPrevUnlisten = createSpyInstance('PrevUnlisten', DisposableFunction.prototype);
      const prevUnlisten = {key: document.createElement('div'), unlisten: mockPrevUnlisten};

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = startWatch_(el, prevUnlisten, mockOnChange)!;

      assert(unlisten.key).to.equal(el);

      const dispatcherMatcher = match.anyThat<(event: TestCustomEvent) => void>().beAFunction();
      assert(mockOnChange).to.haveBeenCalledWith(dispatcherMatcher);
      const dispatchFn = dispatcherMatcher.getLastMatch();

      const event = new TestCustomEvent();
      dispatchFn(event);
      assert(mockListener).to.haveBeenCalledWith(event);
      assert(mockPrevUnlisten.dispose).to.haveBeenCalledWith();
    });

    should(`not call onChange if already bound to the same element`, () => {
      const el = document.createElement('div');

      const mockOnChange = createSpy('OnChange');
      const mockPrevUnlisten = createSpyInstance('PrevUnlisten', DisposableFunction.prototype);
      const prevUnlisten = {key: el, unlisten: mockPrevUnlisten};

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = startWatch_(el, prevUnlisten, mockOnChange)!;

      assert(unlisten).to.equal(prevUnlisten);
      assert(mockOnChange).toNot.haveBeenCalled();
    });
  });

  describe('createWatcher', () => {
    should(`watch correctly`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = '<div></div>';
      const vine = Mocks.object<VineImpl>('vine');
      const mockOnChange = createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const watchedEl = shadowRoot.querySelector('div')!;
      const mockListener = createSpy('Listener');
      watchedEl.addEventListener(CUSTOM_EVENT_NAME, mockListener);

      locator.createWatcher().watch(vine, mockOnChange, shadowRoot);

      const dispatcherMatcher = match.anyThat<(event: TestCustomEvent) => void>().beAFunction();
      assert(mockOnChange).to.haveBeenCalledWith(dispatcherMatcher);
      const dispatchFn = dispatcherMatcher.getLastMatch();

      const event = new TestCustomEvent();
      dispatchFn(event);

      assert(mockListener).to.haveBeenCalledWith(event);
    });
  });

  describe('getValue', () => {
    should(`return the dispatcher if element exists`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = '<div></div>';

      // tslint:disable-next-line:no-non-null-assertion
      const watchedEl = shadowRoot.querySelector('div')!;
      const mockListener = createSpy('Listener');
      watchedEl.addEventListener(CUSTOM_EVENT_NAME, mockListener);

      // tslint:disable-next-line:no-non-null-assertion
      const dispatchFn = locator.getValue(shadowRoot)!;

      const event = new TestCustomEvent();
      dispatchFn(event);

      assert(mockListener).to.haveBeenCalledWith(event);
    });

    should(`return null if element doesn't exist`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      assert(locator.getValue(shadowRoot)).to.beNull();
    });
  });
});
