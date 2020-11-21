import {assert, createSpyObject, run, should, test} from 'gs-testing';
import {of as observableOf} from 'rxjs';

import {createFakeContext} from '../testing/create-fake-context';

import {title} from './title';

test('@persona/output/title', () => {
  should('set the title correctly', () => {
    const ownerDocument = createSpyObject<Document>('Document', []);
    const shadowRoot = createSpyObject<ShadowRoot>('ShadowRoot', [], {ownerDocument});
    const context = createFakeContext({shadowRoot});

    const titleStr = 'titleStr';
    run(observableOf(titleStr).pipe(title().output(context)));

    assert(ownerDocument.title).to.equal(titleStr);
  });
});
