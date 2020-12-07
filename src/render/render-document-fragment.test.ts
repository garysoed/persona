import {assert, createSpySubject, should, test} from 'gs-testing';
import {map} from 'rxjs/operators';

import {createFakeContext} from '../testing/create-fake-context';

import {renderDocumentFragment} from './render-document-fragment';
import {RenderSpecType} from './types/render-spec-type';


test('@persona/render/render-document-fragment', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context};
  });

  should('emit the document fragment', () => {
    const nodeType$ = createSpySubject(
        renderDocumentFragment(
            {type: RenderSpecType.FRAGMENT, id: {}},
            _.context,
        )
            .pipe(map(node => node.nodeType)),
    );

    assert(nodeType$).to.emitSequence([Node.DOCUMENT_FRAGMENT_NODE]);
  });
});
