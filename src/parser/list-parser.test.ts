import {arrayThat, assert, should, test} from 'gs-testing';

import {integerParser} from './integer-parser';
import {listParser} from './list-parser';


test('@persona/src/parser/list-parser', () => {
  test('convertBackward', () => {
    should('parse correctly', () => {
      assert(listParser(integerParser()).convertBackward('12 34 56')).to.haveProperties({
        success: true,
        result: arrayThat<number>().haveExactElements([12, 34, 56]),
      });
    });
  });

  test('convertForward', () => {
    should('parse correctly', () => {
      assert(listParser(integerParser()).convertForward([12, 34, 56])).to.haveProperties({
        success: true,
        result: '12 34 56',
      });
    });
  });
});