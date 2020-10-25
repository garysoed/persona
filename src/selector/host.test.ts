import { assert, should, test } from 'gs-testing';

import { attribute } from '../input/attribute';
import { HostAttribute } from '../main/host-attribute';
import { textOut, TextOutput } from '../output/text-out';
import { createFakeContext } from '../testing/create-fake-context';
import { integerParser } from '../util/parsers';

import { host } from './host';


test('@persona/selector/host', init => {
  const _ = init(() => {
    const input = host({
      attrIn: attribute('attrName', integerParser(), 3),
      output: textOut(),
    });

    return {input};
  });

  test('resolveProperties', () => {
    should(`resolve the properties correctly`, () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const context = createFakeContext({shadowRoot});

      assert(_.input.getSelectable(context)).to.equal(el);
      assert(_.input._.attrIn).to.beAnInstanceOf(HostAttribute);
      assert(_.input._.output).to.beAnInstanceOf(TextOutput);
    });
  });
});
