import { assert, createSpySubject, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { element } from '../main/element';
import { createFakeContext } from '../testing/create-fake-context';

import { onDom } from './on-dom';


test('input.onDom', init => {
  const ELEMENT_ID = 'test';
  const EVENT_NAME = 'eventName';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      onDom: onDom<CustomEvent>(EVENT_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const input = $._.onDom;

    return {input, context: createFakeContext({shadowRoot}), el};
  });

  test('getValue', () => {
    should(`create observable that emits the event`, () => {
      const event = new CustomEvent(EVENT_NAME);
      const valueSpySubject = createSpySubject(_.input.getValue(_.context));
      _.el.dispatchEvent(event);

      assert(valueSpySubject).to.emitWith(event);
    });
  });
});
