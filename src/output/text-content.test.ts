import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { textContent } from './text-content';


test('output.textContent', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      text: textContent(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.text;
    return {output, shadowRoot, el};
  });

  test('output', () => {
    should(`set the text content correctly`, () => {
      const value$ = new Subject<string>();

      run(value$.pipe(_.output.output(_.shadowRoot)));
      const text = 'text';
      value$.next(text);
      assert(_.el.textContent).to.equal(text);
    });
  });
});
