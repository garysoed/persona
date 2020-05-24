import { assert, createSpySubject, mockTime, run, should, test } from 'gs-testing';
import { Subject } from 'rxjs';

import { createFakeContext } from '../testing/create-fake-context';

import { CHECK_INTERVAL_MS, observer } from './host-observer';

test('@persona/main/host-observer', init => {
  const PROPERTY_NAME = 'test$';

  const _ = init(() => {
    const input = observer<number>(PROPERTY_NAME);
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    return {el, input, context: createFakeContext({shadowRoot})};
  });

  test('getValue', () => {
    should(`emit values emitted by the observable`, () => {
      const observed$ = new Subject<number>();
      (_.el as any)[PROPERTY_NAME] = observed$;

      const value$ = createSpySubject(_.input.getValue(_.context));
      observed$.next(1);
      observed$.next(2);
      observed$.next(3);

      assert(value$).to.emitSequence([1, 2, 3]);
    });

    should(`handle when the observable is not initialized`, () => {
      const fakeTime = mockTime(window);
      const value$ = createSpySubject(_.input.getValue(_.context));
      assert(value$).to.emitSequence([]);

      const observed$ = new Subject<number>();
      (_.el as any)[PROPERTY_NAME] = observed$;

      fakeTime.tick(CHECK_INTERVAL_MS);

      observed$.next(1);
      observed$.next(2);
      observed$.next(3);

      assert(value$).to.emitSequence([1, 2, 3]);
    });
  });
});
