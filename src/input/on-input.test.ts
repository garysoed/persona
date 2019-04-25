import { assert, should, test } from '@gs-testing/main';
import { MockScheduler } from '@gs-testing/mock';
import { createSpySubject } from '@gs-testing/spy';
import { InstanceofType } from '@gs-types';
import { element } from '../main/element';
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
    should(`create observable that emits the values`, async () => {
      const inputEvent = new CustomEvent('input');

      const initValue = 'initValue';
      const value1 = 'value1';

      const spySubject = createSpySubject(input.getValue(shadowRoot));

      el.value = initValue;
      el.dispatchEvent(inputEvent);
      spySubject.reset();

      // Immediately change the value. This time nothing should happen because of the
      // debounce.
      el.value = value1;
      el.dispatchEvent(inputEvent);
      assert(spySubject.hasValue()).to.beFalse();

      mockScheduler.tick(DEBOUNCE_MS);

      assert(spySubject.getValue()).to.equal(value1);
    });
  });
});
