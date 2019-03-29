import { assert, should, test } from '@gs-testing/main';
import { Subject } from 'rxjs';
import { InstanceofType } from 'gs-types/export';
import { element } from '../input/element';
import { textContent, TextContentOutput } from './text-content';

test('output.textContent', () => {
  const ELEMENT_ID = 'test';
  let output: TextContentOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
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
      const valueSubject = new Subject<string>();

      output.output(shadowRoot, valueSubject).subscribe();
      const text = 'text';
      valueSubject.next(text);
      assert(el.textContent).to.equal(text);
    });
  });
});
