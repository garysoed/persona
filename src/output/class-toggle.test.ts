import { Subject } from 'rxjs';
import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { createFakeContext } from '../testing/create-fake-context';
import { element } from '../selector/element';

import { classToggle } from './class-toggle';


test('persona.output.classToggle', init => {
  const ELEMENT_ID = 'test';
  const CLASSNAME = 'classname';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      classname: classToggle(CLASSNAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.classname;

    return {output, el, context: createFakeContext({shadowRoot})};
  });

  test('output', () => {
    should('update the attribute correctly', () => {
      const value$ = new Subject<boolean>();

      run(value$.pipe(_.output.output(_.context)));
      value$.next(true);
      assert(_.el.classList.contains(CLASSNAME)).to.beTrue();

      value$.next(false);
      assert(_.el.classList.contains(CLASSNAME)).to.beFalse();
    });
  });
});
