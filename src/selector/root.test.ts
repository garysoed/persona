import { assert, should, test } from 'gs-testing';

import { createFakeContext } from '../testing/create-fake-context';

import { root } from './root';

test('@persona/selector/root', init => {
  const _ = init(() => {
    const input = root({});

    return {input};
  });

  test('resolveProperties', () => {
    should(`resolve the properties correctly`, () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const context = createFakeContext({shadowRoot});

      assert(_.input.getElement(context)).to.equal(shadowRoot);
    });
  });
});
