import { assert, createSpySubject, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { element } from '../main/element';
import { onDom, OnDomInput } from './on-dom';

test('input.onDom', () => {
  const ELEMENT_ID = 'test';
  const EVENT_NAME = 'eventName';
  let input: OnDomInput<CustomEvent>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      onDom: onDom<CustomEvent>(EVENT_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.onDom;
  });

  test('getValue', () => {
    should(`create observable that emits the event`, async () => {
      const event = new CustomEvent(EVENT_NAME);
      const valueSpySubject = createSpySubject();
      input.getValue(shadowRoot).subscribe(valueSpySubject);
      el.dispatchEvent(event);

      await assert(valueSpySubject).to.emitWith(event);
    });
  });
});
