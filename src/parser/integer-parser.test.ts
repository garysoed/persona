import {assert, should, test} from 'gs-testing';
import {failure, success} from 'nabu';

import {integerParser} from './integer-parser';


test('@persona/src/stringify/integer-parser', () => {
  test('convertBackward', () => {
    should('stringify correctly', () => {
      assert(integerParser().convertBackward(12)).to.haveProperties(success('12'));
    });
  });

  test('convertForward', () => {
    should('parse correctly', () => {
      assert(integerParser(5).convertForward('12')).to.haveProperties(success(7));
    });

    should('fail if parse is incorrect', () => {
      assert(integerParser().convertForward('abc')).to.haveProperties(failure());
    });
  });
});