import { assert, should, test } from 'gs-testing';
import { identity } from 'nabu';
import { of as observableOf } from 'rxjs';

import { element } from '../main/element';
import { attribute } from '../output/attribute';

import { mapOutput } from './map-output';

test('@persona/util/map-output', () => {
  should(`map the output value correctly`, () => {
    const ATTR_NAME = 'attr';
    const $ = element({attr: attribute(ATTR_NAME, identity())});

    const root = document.createElement('div');
    const shadow = root.attachShadow({mode: 'open'});

    mapOutput($._.attr, (n: number) => `${n + 2}`).output(shadow, observableOf(123)).subscribe();
    assert(root.getAttribute(ATTR_NAME)).to.equal('125');
  });
});
