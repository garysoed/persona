import { assert, should, test } from '@gs-testing/main';
import { Subject } from 'rxjs';
import { InstanceofType } from 'gs-types/export';
import { element } from '../input/element';
import { innerHtml, InnerHtmlOutput } from './inner-html';

test('output.innerHtml', () => {
  const ELEMENT_ID = 'test';
  let output: InnerHtmlOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
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
      const valueSubject = new Subject<string>();

      output.output(shadowRoot, valueSubject).subscribe();
      const innerHtml = 'innerHtml';
      valueSubject.next(innerHtml);
      assert(el.innerHTML).to.equal(innerHtml);
    });
  });
});
