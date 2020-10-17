import { assert, should, test } from 'gs-testing';

import { attribute } from '../input/attribute';
import { HostAttribute } from '../main/host-attribute';
import { textOut, TextOutput } from '../output/text-out';
import { integerParser } from '../util/parsers';

import { host } from './host';


test('@persona/main/host', init => {
  const _ = init(() => {
    const input = host({
      attrIn: attribute('attrName', integerParser(), 3),
      output: textOut(),
    });

    return {input};
  });

  test('resolveProperties', () => {
    should(`resolve the properties correctly`, () => {
      assert(_.input._.attrIn).to.beAnInstanceOf(HostAttribute);
      assert(_.input._.output).to.beAnInstanceOf(TextOutput);
    });
  });
});
