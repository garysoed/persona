import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { ReplaySubject, Subject } from 'rxjs';

import { createFakeContext } from '../testing/create-fake-context';

import { emitter } from './host-emitter';


test('@persona/main/host-emitter', init => {
  const PROPERTY_NAME = 'test$';

  const _ = init(() => {
    const output = emitter(PROPERTY_NAME, () => new Subject<number>());
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    return {el, output, context: createFakeContext({shadowRoot})};
  });

  test('output', () => {
    should(`create a subject and emit it on output`, () => {
      const value$ = new Subject<number>();
      run(value$.pipe(_.output.output(_.context)));

      const actualValue$ = createSpySubject((_.el as any)[PROPERTY_NAME]);
      value$.next(1);
      value$.next(2);
      value$.next(4);
      assert(actualValue$).to.emitSequence([1, 2, 4]);
    });

    should(`reuse existing subject`, () => {
      const existing$ = new ReplaySubject<number>(4);
      (_.el as any)[PROPERTY_NAME] = existing$;


      const value$ = new Subject<number>();
      run(value$.pipe(_.output.output(_.context)));

      value$.next(1);
      value$.next(2);
      value$.next(4);
      assert(existing$).to.emitSequence([1, 2, 4]);
    });
  });
});
