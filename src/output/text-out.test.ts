import { Subject } from 'rxjs';
import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { createFakeContext } from '../testing/create-fake-context';
import { element } from '../selector/element';

import { textOut } from './text-out';


test('@persona/output/text-out', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      text: textOut(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.text;
    return {output, context: createFakeContext({shadowRoot}), el};
  });

  test('output', () => {
    should('set the text content correctly', () => {
      const value$ = new Subject<string>();

      run(value$.pipe(_.output.output(_.context)));
      const text = 'text';
      value$.next(text);
      assert(_.el.textContent).to.equal(text);
    });
  });
});
