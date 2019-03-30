import { assert, should, test } from '@gs-testing/main';
import { Subject } from 'rxjs';
import { InstanceofType } from '@gs-types';
import { element } from '../input/element';
import { setAttribute, SetAttributeOutput } from './set-attribute';

test('output.setAttribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  let output: SetAttributeOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
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
      const valueSubject = new Subject<boolean>();

      output.output(shadowRoot, valueSubject).subscribe();
      valueSubject.next(true);
      assert(el.hasAttribute(ATTR_NAME)).to.beTrue();

      valueSubject.next(false);
      assert(el.hasAttribute(ATTR_NAME)).to.beFalse();
    });
  });
});
