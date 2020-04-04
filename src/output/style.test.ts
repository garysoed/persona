import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { style, StyleOutput } from './style';

test('output.style', () => {
  const ELEMENT_ID = 'test';
  let output: StyleOutput<'height'>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
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
      const value$ = new Subject<string>();

      value$.pipe(output.output(shadowRoot)).subscribe();
      const height = '123px';
      value$.next(height);
      assert(el.style.height).to.equal(height);
    });
  });
});
