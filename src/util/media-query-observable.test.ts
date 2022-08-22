import {assert, should, test, setup} from 'gs-testing';

import {setupTest} from '../testing/setup-test';

import {mediaQueryObservable} from './media-query-observable';


test('@persona/src/util/media-query-observable', () => {
  const QUERY = 'query';

  const _ = setup(() => {
    const tester = setupTest({});
    return {tester};
  });

  test('getValue', () => {
    should('emit the correct value on changes', () => {
      const matches$ = mediaQueryObservable(QUERY);

      assert(matches$).to.emitWith(false);

      _.tester.setMedia(QUERY, true);
      assert(matches$).to.emitWith(true);
    });
  });
});
