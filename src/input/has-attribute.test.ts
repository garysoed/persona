import {assert, should, test} from 'gs-testing';
import {instanceofType} from 'gs-types';

import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {hasAttribute} from './has-attribute';


test('persona.input.hasAttribute', init => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      hasAttr: hasAttribute(ATTR_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const input = $._.hasAttr;

    return {input, context: createFakeContext({shadowRoot}), el};
  });

  test('getValue', () => {
    should('create observable that emits true iff the attribute exists', () => {
      _.el.setAttribute(ATTR_NAME, '');
      assert(_.input.getValue(_.context)).to.emitWith(true);

      _.el.removeAttribute(ATTR_NAME);

      assert(_.input.getValue(_.context)).to.emitWith(false);
    });
  });
});
