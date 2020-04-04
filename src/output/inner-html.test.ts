import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { innerHtml, InnerHtmlOutput } from './inner-html';

test('output.innerHtml', () => {
  const ELEMENT_ID = 'test';
  let output: InnerHtmlOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      innerHtml: innerHtml(),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.innerHtml;
  });

  test('output', () => {
    should(`set the inner HTML correctly`, () => {
      const value$ = new Subject<string>();

      value$.pipe(output.output(shadowRoot)).subscribe();
      const innerHtml = 'innerHtml';
      value$.next(innerHtml);
      assert(el.innerHTML).to.equal(innerHtml);
    });
  });
});
