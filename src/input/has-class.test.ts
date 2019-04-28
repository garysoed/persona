import { assert, setup, should, test } from '@gs-testing';
import { InstanceofType } from '@gs-types';
import { element } from '../main/element';
import { hasClass, HasClassInput } from './has-class';

test('persona.input.hasClass', () => {
  const ELEMENT_ID = 'test';
  const CLASSNAME = 'classname';

  let input: HasClassInput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  setup(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      hasClass: hasClass(CLASSNAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.hasClass;
  });

  test('getValue', () => {
    should(`emit true if the class exists`, async () => {
      el.classList.add(CLASSNAME);

      await assert(input.getValue(shadowRoot)).to.emitWith(true);
    });

    should(`emit false if the class doesn't exist`, async () => {
      await assert(input.getValue(shadowRoot)).to.emitWith(false);
    });
  });
});
