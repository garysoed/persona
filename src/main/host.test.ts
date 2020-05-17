import { integerParser, textContent } from 'export';
import { assert, should, test } from 'gs-testing';

import { attribute } from '../input/attribute';
import { TextContentOutput } from '../output/text-content';

import { host } from './host';
import { HostAttribute } from './host-attribute';


test('@persona/main/host', init => {
  const _ = init(() => {
    const input = host({
      attrIn: attribute('attrName', integerParser(), 3),
      output: textContent(),
    });

    return {input};
  });

  test('resolveProperties', () => {
    should(`resolve the properties correctly`, () => {
      assert(_.input._.attrIn).to.beAnInstanceOf(HostAttribute);
      assert(_.input._.output).to.beAnInstanceOf(TextContentOutput);
    });
  });
});
