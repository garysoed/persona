import { ReplaySubject, of as observableOf } from 'rxjs';
import { assert, createSpySubject, run, should, test } from 'gs-testing';

import { createFakeContext } from '../testing/create-fake-context';
import { host } from '../selector/host';

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
    should('emit values emitted by the observable', () => {
      const elValue$ = new ReplaySubject<number>(3);
      Object.assign(_.el, {[PROPERTY_NAME]: elValue$});

      run(observableOf(1, 2, 3).pipe(_.output.output(_.context)));

      assert(elValue$).to.emitSequence([1, 2, 3]);
    });

    should('add observable when the observable is not initialized', () => {
      run(observableOf(1, 2, 3).pipe(_.output.output(_.context)));

      const elValue$ = createSpySubject((_.el as any)[PROPERTY_NAME]);

      assert(elValue$).to.emitSequence([3]);
    });
  });
});
