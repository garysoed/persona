import { assert, should, test } from 'gs-testing';

import { createFakeContext } from '../testing/create-fake-context';

import { ownerDocument } from './owner-document';


test('@persona/input/owner-document', () => {
  should('emit the owner document', () => {
    const document = new Document();
    const el = document.createElement('div');
    const context = createFakeContext({
      shadowRoot: el.attachShadow({mode: 'open'}),
    });

    assert(ownerDocument().getValue(context)).to.emitWith(document);
  });
});
