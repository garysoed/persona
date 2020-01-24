import { assert, should, test } from '@gs-testing';
import { identity } from '@nabu';
import { of as observableOf } from '@rxjs';

import { element } from '../main/element';
import { attribute } from '../output/attribute';

import { splitOutput } from './split-output';

test('@persona/util/split-output', () => {
  should(`split the output to two different outputs correctly`, () => {
    const ATTR_NAME_1 = 'attr1';
    const ATTR_NAME_2 = 'attr2';
    const $ = element({
      attr1: attribute(ATTR_NAME_1, identity()),
      attr2: attribute(ATTR_NAME_2, identity()),
    });

    const root = document.createElement('div');
    const shadow = root.attachShadow({mode: 'open'});

    splitOutput([$._.attr1, $._.attr2]).output(shadow, observableOf('abc')).subscribe();
    assert(root.getAttribute(ATTR_NAME_1)).to.equal('abc');
    assert(root.getAttribute(ATTR_NAME_2)).to.equal('abc');
  });
});
