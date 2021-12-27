import {assert, should, test} from 'gs-testing';

import {integerParser} from '../../src-next/util/parsers';
import {attribute} from '../input/attribute';
import {HostAttribute} from '../main/host-attribute';
import {TextOutput, textOut} from '../output/text-out';
import {createFakeContext} from '../testing/create-fake-context';

import {host} from './host';


test('@persona/selector/host', init => {
  const _ = init(() => {
    const input = host({
      attrIn: attribute('attrName', integerParser(), 3),
      output: textOut(),
      group: {
        attrIn: attribute('attrName2', integerParser(), 5),
      },
    });

    return {input};
  });

  test('resolveProperties', () => {
    should('resolve the properties correctly', () => {
      const el = document.createElement('div');
      const shadowRoot = el.attachShadow({mode: 'open'});
      const context = createFakeContext({shadowRoot});

      assert(_.input.getSelectable(context)).to.equal(el);
      assert(_.input._.attrIn).to.beAnInstanceOf(HostAttribute);
      assert(_.input._.output).to.beAnInstanceOf(TextOutput);
      assert(_.input._.group.attrIn).to.beAnInstanceOf(HostAttribute);
    });
  });
});
