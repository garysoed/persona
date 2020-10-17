import { assert, run, should, test } from 'gs-testing';
import { identity } from 'nabu';
import { of as observableOf } from 'rxjs';

import { attribute } from '../output/attribute';
import { host } from '../selector/host';
import { createFakeContext } from '../testing/create-fake-context';

import { splitOutput } from './split-output';


test('@persona/util/split-output', () => {
  should(`split the output to two different outputs correctly`, () => {
    const ATTR_NAME_1 = 'attr1';
    const ATTR_NAME_2 = 'attr2';
    const $ = host({
      attr1: attribute(ATTR_NAME_1, identity()),
      attr2: attribute(ATTR_NAME_2, identity()),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    run(observableOf('abc').pipe(splitOutput([$._.attr1, $._.attr2])
        .output(createFakeContext({shadowRoot}))));
    assert(root.getAttribute(ATTR_NAME_1)).to.equal('abc');
    assert(root.getAttribute(ATTR_NAME_2)).to.equal('abc');
  });
});
