import {assert, should, test} from 'gs-testing';

import {integerParser} from './integer-parser';


test('@persona/src/stringify/integer-parser', () => {
  test('convertBackward', () => {
    should('parse correctly', () => {
      assert(integerParser(5).convertBackward('12')).to.haveProperties({
        result: 7,
        success: true,
      });
    });

    should('fail if parse is incorrect', () => {
      assert(integerParser().convertBackward('abc')).to.haveProperties({
        success: false,
      });
    });
  });

  test('convertForward', () => {
    should('stringify correctly', () => {
      assert(integerParser().convertForward(12)).to.haveProperties({
        result: '12',
        success: true,
      });
    });
  });
});