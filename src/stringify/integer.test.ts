import {assert, should, test} from 'gs-testing';

import {integer} from './integer';


test('@persona/src/stringify/integer', () => {
  test('convertBackward', () => {
    should('parse correctly', () => {
      assert(integer(5).convertBackward('12')).to.haveProperties({
        result: 7,
        success: true,
      });
    });

    should('fail if parse is incorrect', () => {
      assert(integer().convertBackward('abc')).to.haveProperties({
        success: false,
      });
    });

    should('return null for null', () => {
      assert(integer().convertBackward(null)).to.haveProperties({
        result: null,
        success: true,
      });
    });
  });

  test('convertForward', () => {
    should('stringify correctly', () => {
      assert(integer().convertForward(12)).to.haveProperties({
        result: '12',
        success: true,
      });
    });
  });
});