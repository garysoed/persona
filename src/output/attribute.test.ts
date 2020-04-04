import { assert, setup, should, test } from 'gs-testing';
import { integerConverter } from 'gs-tools/export/serializer';
import { instanceofType } from 'gs-types';
import { compose, human } from 'nabu';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { attribute, AttributeOutput } from './attribute';


test('output.attribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  let output: AttributeOutput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  setup(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      attr: attribute(
          ATTR_NAME,
          compose(integerConverter(), human()),
          234,
      ),
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
      const value$ = new Subject<number>();

      value$.pipe(output.output(shadowRoot)).subscribe();
      value$.next(123);
      assert(el.getAttribute(ATTR_NAME)).to.equal(`123`);

      value$.next(234);
      assert(el.hasAttribute(ATTR_NAME)).to.beFalse();
    });
  });
});
