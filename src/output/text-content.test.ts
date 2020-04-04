import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { textContent, TextContentOutput } from './text-content';

test('output.textContent', () => {
  const ELEMENT_ID = 'test';
  let output: TextContentOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      text: textContent(),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.text;
  });

  test('output', () => {
    should(`set the text content correctly`, () => {
      const value$ = new Subject<string>();

      run(value$.pipe(output.output(shadowRoot)));
      const text = 'text';
      value$.next(text);
      assert(el.textContent).to.equal(text);
    });
  });
});
