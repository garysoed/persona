import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { setAttribute, SetAttributeOutput } from './set-attribute';

test('output.setAttribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  let output: SetAttributeOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      attr: setAttribute(ATTR_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.attr;
  });

  test('output', () => {
    should(`update the attribute correctly`, () => {
      const value$ = new Subject<boolean>();

      run(value$.pipe(output.output(shadowRoot)));
      value$.next(true);
      assert(el.hasAttribute(ATTR_NAME)).to.beTrue();

      value$.next(false);
      assert(el.hasAttribute(ATTR_NAME)).to.beFalse();
    });
  });
});
