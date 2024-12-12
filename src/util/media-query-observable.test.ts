import {asyncAssert, setup, should, test} from 'gs-testing';

import {setupTest} from '../testing/setup-test';

import {mediaQueryObservable} from './media-query-observable';

test('@persona/src/util/media-query-observable', () => {
  const QUERY = 'query';

  const _ = setup(() => {
    const tester = setupTest({});
    return {tester};
  });

  test('getValue', () => {
    should('emit the correct value on changes', async () => {
      const matches$ = mediaQueryObservable(QUERY);

      await asyncAssert(matches$).to.emitWith(false);

      _.tester.setMedia(QUERY, true);
      await asyncAssert(matches$).to.emitWith(true);
    });
  });
});
