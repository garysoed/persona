import {assert, run, should, test} from 'gs-testing';
import {instanceofType} from 'gs-types';
import {Subject} from 'rxjs';

import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {style} from './style';


test('output.style', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      style: style('height'),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.style;

    return {output, context: createFakeContext({shadowRoot}), el};
  });

  test('output', () => {
    should('set the style correctly', () => {
      const value$ = new Subject<string>();

      run(value$.pipe(_.output.output(_.context)));
      const height = '123px';
      value$.next(height);
      assert(_.el.style.height).to.equal(height);
    });
  });
});
