import { assert, should, test } from 'gs-testing/export/main';
import { MockScheduler } from 'gs-testing/export/mock';
import { createSpySubject } from 'gs-testing/export/spy';
import { InstanceofType } from 'gs-types/export';
import { element } from './element';
import { onInput, OnInputInput } from './on-input';

test('input.onInput', () => {
  const ELEMENT_ID = 'test';
  const DEBOUNCE_MS = 123;
  let input: OnInputInput;
  let shadowRoot: ShadowRoot;
  let el: HTMLInputElement;
  let mockScheduler: MockScheduler;

  beforeEach(() => {
    mockScheduler = new MockScheduler();
    const $ = element(ELEMENT_ID, InstanceofType(HTMLInputElement), {
      onInput: onInput(DEBOUNCE_MS, undefined, mockScheduler),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('input');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.onInput;
  });

  test('getValue', () => {
    should(`create observable that emits the values`, () => {
      const inputEvent = new CustomEvent('input');

      const initValue = 'initValue';
      const value1 = 'value1';

      el.value = initValue;
      const spySubject = createSpySubject(input.getValue(shadowRoot));
      assert(spySubject.getValue()).to.equal(initValue);

      // Immediately change the value again. This time nothing should happen because of the
      // debounce.
      el.value = value1;
      el.dispatchEvent(inputEvent);
      assert(spySubject.getValue()).to.equal(initValue);

      mockScheduler.tick(DEBOUNCE_MS);

      assert(spySubject.getValue()).to.equal(value1);
    });
  });
});
