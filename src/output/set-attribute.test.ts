import { Subject } from 'rxjs';
import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { createFakeContext } from '../testing/create-fake-context';
import { element } from '../selector/element';

import { setAttribute } from './set-attribute';


test('output.setAttribute', init => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      attr: setAttribute(ATTR_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.attr;
    return {output, context: createFakeContext({shadowRoot}), el};
  });

  test('output', () => {
    should('update the attribute correctly', () => {
      const value$ = new Subject<boolean>();

      run(value$.pipe(_.output.output(_.context)));
      value$.next(true);
      assert(_.el.hasAttribute(ATTR_NAME)).to.beTrue();

      value$.next(false);
      assert(_.el.hasAttribute(ATTR_NAME)).to.beFalse();
    });
  });
});
