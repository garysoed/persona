import { VineImpl } from 'grapevine/export/main';
import { assert, should } from 'gs-testing/export/main';
import { mocks } from 'gs-testing/export/mock';
import { createSpy, resetCalls } from 'gs-testing/export/spy';
import { InstanceofType } from 'gs-types/export';
import { BehaviorSubject } from 'rxjs';
import { DispatchFn, ResolvedDispatcherLocator } from './dispatcher-locator';
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
        element('div', InstanceofType(HTMLDivElement)));
  });

  describe('getObservableValue', () => {
    should(`emit the dispatcher`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = '<div></div>';
      const vine = mocks.object<VineImpl>('vine');
      const mockOnChange = createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const watchedEl = shadowRoot.querySelector('div')!;
      const mockListener = createSpy('Listener');
      watchedEl.addEventListener(CUSTOM_EVENT_NAME, mockListener);

      const dispatcherSubject = new BehaviorSubject<DispatchFn<CustomEvent>|null>(null);
      locator.getObservableValue(shadowRoot).subscribe(dispatcherSubject);

      const event1 = new TestCustomEvent();
      // tslint:disable-next-line:no-non-null-assertion
      dispatcherSubject.getValue()!(event1);
      assert(mockListener).to.haveBeenCalledWith(event1);
      resetCalls(mockListener);
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
  });
});
