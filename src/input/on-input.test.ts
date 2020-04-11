import { assert, createSpySubject, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { element } from '../main/element';

import { onInput } from './on-input';


test('input.onInput', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLInputElement), {
      onInput: onInput(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('input');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const input = $._.onInput;

    return {input, shadowRoot, el};
  });

  test('getValue', () => {
    should(`create observable that emits the values`, () => {
      const inputEvent = new CustomEvent('input');

      const initValue = 'initValue';
      const value1 = 'value1';

      const spySubject = createSpySubject(_.input.getValue(_.shadowRoot));

      _.el.value = initValue;
      _.el.dispatchEvent(inputEvent);

      _.el.value = value1;
      _.el.dispatchEvent(inputEvent);
      assert(spySubject).to.emitWith(value1);
    });
  });
});
