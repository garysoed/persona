import {assert, should, test} from 'gs-testing';
import {failure, success} from 'nabu';

import {numberParser} from './number-parser';

test('@persona/src/parser/number-parser', () => {
  test('convertBackward', () => {
    should('convert correctly', () => {
      assert(numberParser().convertBackward(123.45)).to.haveProperties(success('123.45'));
    });
  });

  test('convertForward', () => {
    should('convert integers correctly', () => {
      assert(numberParser().convertForward('-123')).to.haveProperties(success(-123));
    });

    should('convert floats correctly', () => {
      assert(numberParser().convertForward('123.45')).to.haveProperties(success(123.45));
    });

    should('fail if the number has suffixes', () => {
      assert(numberParser().convertForward('123rem')).to.haveProperties(failure());
    });
  });
});