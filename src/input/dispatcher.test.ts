import { assert, should, test } from 'gs-testing/export/main';
import { createSpy, createSpySubject } from 'gs-testing/export/spy';
import { InstanceofType } from 'gs-types/export';
import { dispatcher, DispatcherInput } from './dispatcher';
import { element } from './element';

test('input.dispatcher', () => {
  const ELEMENT_ID = 'test';
  let input: DispatcherInput<Event>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      dispatch: dispatcher(),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.dispatch;
  });

  test('getValue', () => {
    should(`create observable that emits the dispatcher`, () => {
      const eventName = 'eventName';
      const spy = createSpy<void, [Event]>('EventHandler');
      el.addEventListener(eventName, spy);

      const spySubject = createSpySubject(input.getValue(shadowRoot));
      const event = new CustomEvent(eventName);
      spySubject.getValue()(event);

      assert(spy).to.haveBeenCalledWith(event);
    });
  });
});
