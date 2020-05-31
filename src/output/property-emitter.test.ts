import { assert, run, should, test } from 'gs-testing';
import { of as observableOf, ReplaySubject } from 'rxjs';

import { host } from '../main/host';
import { createFakeContext } from '../testing/create-fake-context';

import { emitter } from './property-emitter';


test('@persona/output/property-emitter', init => {
  const PROPERTY_NAME = 'test$';

  const _ = init(() => {
    const $ = host({value: emitter(PROPERTY_NAME)});
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});

    return {el, output: $._.value, context: createFakeContext({shadowRoot})};
  });

  test('getValue', () => {
    should(`emit values emitted by the observable`, () => {
      const elValue$ = new ReplaySubject<number>(3);
      Object.assign(_.el, {[PROPERTY_NAME]: elValue$});

      run(observableOf(1, 2, 3).pipe(_.output.output(_.context)));

      assert(elValue$).to.emitSequence([1, 2, 3]);
    });

    should(`throw error when the observable is not initialized`, () => {
      assert(observableOf(1, 2, 3).pipe(_.output.output(_.context)))
          .to.emitErrorWithMessage(/has no emitter/);
    });
  });
});
