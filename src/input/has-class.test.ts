import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { element } from '../main/element';

import { hasClass, HasClassInput } from './has-class';

test('persona.input.hasClass', init => {
  const ELEMENT_ID = 'test';
  const CLASSNAME = 'classname';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      hasClass: hasClass(CLASSNAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const input = $._.hasClass;
    return {input, shadowRoot, el};
  });

  test('getValue', () => {
    should(`emit true if the class exists`, () => {
      _.el.classList.add(CLASSNAME);

      assert(_.input.getValue(_.shadowRoot)).to.emitWith(true);
    });

    should(`emit false if the class doesn't exist`, () => {
      assert(_.input.getValue(_.shadowRoot)).to.emitWith(false);
    });
  });
});
