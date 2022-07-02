import {arrayThat, assert, should, test} from 'gs-testing';
import {success} from 'nabu';

import {integerParser} from './integer-parser';
import {listParser} from './list-parser';


test('@persona/src/parser/list-parser', () => {
  test('convertBackward', () => {
    should('parse correctly', () => {
      assert(listParser(integerParser()).convertBackward([12, 34, 56])).to
          .haveProperties(success('12 34 56'));
    });
  });

  test('convertForward', () => {
    should('parse correctly', () => {
      assert(listParser(integerParser()).convertForward('12 34 56')).to
          .haveProperties(success(arrayThat<number>().haveExactElements([12, 34, 56])));
    });
  });
});