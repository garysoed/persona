import { assert, createSpyObject, run, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';

import { createFakeContext } from '../testing/create-fake-context';

import { favicon } from './favicon';

test('@persona/output/favicon', init => {
  const _ = init(() => {
    const head = document.createElement('head');
    const ownerDocument = createSpyObject<Document>(
        'Document',
        [],
        {
          head,
          createElement: (tag: string) => document.createElement(tag),
        });
    const shadowRoot = createSpyObject<ShadowRoot>('ShadowRoot', [], {ownerDocument});
    const context = createFakeContext({shadowRoot});
    const output = favicon();

    return {context, head, output};
  });

  should('create the link element correctly', () => {
    const href = 'href';
    run(observableOf(href).pipe(_.output.output(_.context)));

    const el = _.head.children.item(0) as HTMLLinkElement;
    assert(el.rel).to.equal('icon');
    assert(el.href).to.match(new RegExp(href));
  });

  should('reuse an existing link element if one exists', () => {
    const linkEl = document.createElement('link');
    linkEl.rel = 'icon';
    _.head.appendChild(linkEl);

    const href = 'href';
    run(observableOf(href).pipe(_.output.output(_.context)));

    assert(linkEl.rel).to.equal('icon');
    assert(linkEl.href).to.match(new RegExp(href));
  });
});
