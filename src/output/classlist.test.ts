import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../selector/element';
import { createFakeContext } from '../testing/create-fake-context';

import { classlist } from './classlist';


test('output.classlist', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      classlist: classlist(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.classlist;

    return {output, context: createFakeContext({shadowRoot}), el};
  });

  test('output', () => {
    should(`update the classes correctly`, () => {
      const value$ = new Subject<ReadonlySet<string>>();

      run(value$.pipe(_.output.output(_.context)));
      value$.next(new Set(['a', 'b', 'c']));
      assert(_.el.getAttribute('class')).to.equal(`a b c`);
    });
  });
});
