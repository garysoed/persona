import { assert, createSpySubject, mockTime, should, test } from 'gs-testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { host } from '../main/host';
import { createFakeContext } from '../testing/create-fake-context';

import { observer } from './property-observer';


test('@persona/input/property-observer', init => {
  const PROPERTY_NAME = 'test$';

  const _ = init(() => {
    const $ = host({value: observer(PROPERTY_NAME)});
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});

    return {el, input: $._.value, context: createFakeContext({shadowRoot})};
  });

  test('getValue', () => {
    should(`emit values emitted by the observable`, () => {
      const elValue$ = new ReplaySubject<number>(1);
      Object.assign(_.el, {[PROPERTY_NAME]: elValue$});

      const value$ = createSpySubject(_.input.getValue(_.context));
      elValue$.next(1);
      elValue$.next(2);
      elValue$.next(3);

      assert(value$).to.emitSequence([1, 2, 3]);
    });

    should(`regularly check when the observable is not initialized`, () => {
      const elValue$ = new BehaviorSubject<number>(1);
      const fakeTime = mockTime(window);
      const value$ = createSpySubject(_.input.getValue(_.context));

      assert(value$).toNot.emit();

      // Add the observable and tick time.
      Object.assign(_.el, {[PROPERTY_NAME]: elValue$});
      fakeTime.tickToTrigger();

      assert(value$).to.emitSequence([1]);
    });
  });
});
