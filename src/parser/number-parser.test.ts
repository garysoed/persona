import {assert, should, test} from 'gs-testing';

import {numberParser} from './number-parser';

test('@persona/src/parser/number-parser', () => {
  test('convertBackward', () => {
    should('convert integers correctly', () => {
      assert(numberParser().convertBackward('-123')).to.haveProperties({
        result: -123,
        success: true,
      });
    });

    should('convert floats correctly', () => {
      assert(numberParser().convertBackward('123.45')).to.haveProperties({
        result: 123.45,
        success: true,
      });});

    should('fail if the number has suffixes', () => {
      assert(numberParser().convertBackward('123rem')).to.haveProperties({
        success: false,
      });
    });
  });

  test('convertForward', () => {
    should('convert correctly', () => {
      assert(numberParser().convertForward(123.45)).to.haveProperties({
        result: '123.45',
        success: true,
      });
    });
  });
});