import { assert, run, should, test } from 'gs-testing';
import { identity } from 'nabu';
import { of as observableOf } from 'rxjs';

import { host } from '../main/host';
import { attribute } from '../output/attribute';
import { createFakeContext } from '../testing/create-fake-context';

import { mapOutput } from './map-output';


test('@persona/util/map-output', () => {
  should(`map the output value correctly`, () => {
    const ATTR_NAME = 'attr';
    const $ = host({attr: attribute(ATTR_NAME, identity())});

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    run(observableOf(123)
        .pipe(
            mapOutput($._.attr, (n: number) => `${n + 2}`).output(createFakeContext({shadowRoot})),
        ));
    assert(root.getAttribute(ATTR_NAME)).to.equal('125');
  });
});
