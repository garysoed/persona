import { assert, run, should, test } from 'gs-testing';
import { integerConverter } from 'gs-tools/export/serializer';
import { instanceofType } from 'gs-types';
import { compose, human } from 'nabu';
import { Subject } from 'rxjs';

import { element } from '../main/element';

import { attribute } from './attribute';


test('output.attribute', init => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      attr: attribute(
          ATTR_NAME,
          compose(integerConverter(), human()),
          234,
      ),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.attr;
    return {output, shadowRoot, el};
  });

  test('output', () => {
    should(`update the attribute correctly`, () => {
      const value$ = new Subject<number>();

      run(value$.pipe(_.output.output(_.shadowRoot)));
      value$.next(123);
      assert(_.el.getAttribute(ATTR_NAME)).to.equal(`123`);

      value$.next(234);
      assert(_.el.hasAttribute(ATTR_NAME)).to.beFalse();
    });
  });
});
