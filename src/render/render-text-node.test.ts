import { assert, createSpySubject, should, test } from 'gs-testing';
import { map, shareReplay } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';

import { createFakeContext } from '../testing/create-fake-context';

import { renderTextNode } from './render-text-node';

test('@persona/render/render-text-node', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context};
  });

  should('emit the text node', () => {
    const text = 'text';
    const node$ = renderTextNode(observableOf(text), text, _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const text$ = createSpySubject(node$.pipe(map(n => n.textContent)));
    const nodeType$ = createSpySubject(node$.pipe(map(n => n.nodeType)));

    assert(text$).to.emitSequence([text]);
    assert(nodeType$).to.emitSequence([Node.TEXT_NODE]);
  });

  should('update the textContent without emitting the node', () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const node$ = renderTextNode(observableOf(text1, text2), {}, _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const text$ = createSpySubject(node$.pipe(map(n => n.textContent)));
    const nodeType$ = createSpySubject(node$.pipe(map(n => n.nodeType)));

    assert(text$).to.emitSequence([text2]);
    assert(nodeType$).to.emitSequence([Node.TEXT_NODE]);
  });
});
