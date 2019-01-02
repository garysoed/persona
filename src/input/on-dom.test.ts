import { assert, should, test } from 'gs-testing/export/main';
import { InstanceofType } from 'gs-types/export';
import { element } from './element';
import { onDom, OnDomInput } from './on-dom';

test('input.onDom', () => {
  const ELEMENT_ID = 'test';
  const EVENT_NAME = 'eventName';
  let input: OnDomInput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      onDom: onDom(EVENT_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.onDom;
  });

  test('getValue', () => {
    should(`create observable that emits the event`, () => {
      const event = new CustomEvent(EVENT_NAME);
      el.dispatchEvent(event);

      assert(input.getValue(shadowRoot)).to.emitWith(event);
    });
  });
});