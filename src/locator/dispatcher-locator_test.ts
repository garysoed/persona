import { VineImpl } from 'grapevine/export/main';
import { assert, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, resetCalls } from 'gs-testing/export/spy';
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
  let locator: ResolvedDispatcherLocator<CustomEvent>;

  beforeEach(() => {
    locator = new ResolvedDispatcherLocator(
        element('div', NullableType(InstanceofType(HTMLDivElement))));
  });

  describe('startWatch_', () => {
    should(`call onChange and return the correct unlisten if element exists`, () => {
      const el = document.createElement('div');
      const mockListener = createSpy('Listener');
      el.addEventListener(CUSTOM_EVENT_NAME, mockListener);
      const root = document.createElement('div').attachShadow({mode: 'open'});

      const mockOnChange = createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = startWatch_(root, el, null, mockOnChange)!;

      assert(unlisten.key).to.equal(el);

      assert(mockOnChange).to.haveBeenCalledWith(root);
    });

    should(`call onChange and return null if element doesn't exist`, () => {
      const mockOnChange = createSpy('OnChange');
      const root = document.createElement('div').attachShadow({mode: 'open'});
      const unlisten = startWatch_(root, null, null, mockOnChange);

      assert(unlisten).to.beNull();
      assert(mockOnChange).to.haveBeenCalledWith(root);
    });

    should(`dispose the previous unlisten if exist`, () => {
      const el = document.createElement('div');
      const mockListener = createSpy('Listener');
      el.addEventListener(CUSTOM_EVENT_NAME, mockListener);

      const mockOnChange = createSpy('OnChange');
      const mockPrevUnlisten = createSpyInstance('PrevUnlisten', DisposableFunction.prototype);
      const prevUnlisten = {key: document.createElement('div'), unlisten: mockPrevUnlisten};
      const root = document.createElement('div').attachShadow({mode: 'open'});

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = startWatch_(root, el, prevUnlisten, mockOnChange)!;

      assert(unlisten.key).to.equal(el);

      assert(mockOnChange).to.haveBeenCalledWith(root);
      assert(mockPrevUnlisten.dispose).to.haveBeenCalledWith();
    });

    should(`not call onChange if already bound to the same element`, () => {
      const el = document.createElement('div');

      const mockOnChange = createSpy('OnChange');
      const mockPrevUnlisten = createSpyInstance('PrevUnlisten', DisposableFunction.prototype);
      const prevUnlisten = {key: el, unlisten: mockPrevUnlisten};
      const root = document.createElement('div').attachShadow({mode: 'open'});

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = startWatch_(root, el, prevUnlisten, mockOnChange)!;

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

      const watcher = locator.createWatcher();

      const event1 = new TestCustomEvent();
      // tslint:disable-next-line:no-non-null-assertion
      watcher.getValue(shadowRoot)!(event1);
      assert(mockListener).to.haveBeenCalledWith(event1);
      resetCalls(mockListener);

      watcher.watch(vine, mockOnChange, shadowRoot);

      assert(mockOnChange).to.haveBeenCalledWith(shadowRoot);
    });

    should(`create watcher that handles case where the element doesn't exist`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const watcher = locator.createWatcher();

      assert(watcher.getValue(shadowRoot)).to.beNull();
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
