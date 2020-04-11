import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { innerHtml } from './inner-html';


test('output.innerHtml', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      innerHtml: innerHtml(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.innerHtml;
    return {output, shadowRoot, el};
  });

  test('output', () => {
    should(`set the inner HTML correctly`, () => {
      const value$ = new Subject<string>();

      run(value$.pipe(_.output.output(_.shadowRoot)));
      const innerHtml = 'innerHtml';
      value$.next(innerHtml);
      assert(_.el.innerHTML).to.equal(innerHtml);
    });
  });
});
