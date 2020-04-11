import { assert, createSpy, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { of as observableOf } from 'rxjs';

import { element } from '../main/element';

import { caller, CallerOutput } from './caller';


test('input.caller', init => {
  const FUNCTION_NAME = 'testFn';
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      caller: caller<[number]>(FUNCTION_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.caller;
    return {output, shadowRoot, el};
  });

  test('output', () => {
    should(`call the function specified`, () => {
      const spy = createSpy<void, [number]>('handler');
      (_.el as any)[FUNCTION_NAME] = spy;

      const value = 123;
      run(observableOf([value] as [number]).pipe(_.output.output(_.shadowRoot)));

      assert(spy).to.haveBeenCalledWith(value);
    });
  });
});
