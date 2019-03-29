import { assert, should, test } from '@gs-testing/main';
import { Subject } from 'rxjs';
import { InstanceofType } from 'gs-types/export';
import { element } from '../input/element';
import { style, StyleOutput } from './style';

test('output.style', () => {
  const ELEMENT_ID = 'test';
  let output: StyleOutput<'height'>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      style: style('height'),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.style;
  });

  test('output', () => {
    should(`set the style correctly`, () => {
      const valueSubject = new Subject<string>();

      output.output(shadowRoot, valueSubject).subscribe();
      const height = '123px';
      valueSubject.next(height);
      assert(el.style.height).to.equal(height);
    });
  });
});
