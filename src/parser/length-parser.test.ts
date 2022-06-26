import {assert, should, test} from 'gs-testing';

import {lengthParser} from './length-parser';

test('@persona/src/parser/length-parser', () => {
  test('convertBackward', () => {
    should('parse numbers correctly', () => {
      assert(lengthParser().convertBackward('123.45')).to.haveProperties({
        result: 123.45,
        success: true,
      });
    });

    should('parse lengths with suffixes correctly', () => {
      assert(lengthParser().convertBackward('123.45rem')).to.haveProperties({
        result: '123.45rem',
        success: true,
      });
    });

    should('fail if not a length', () => {
      assert(lengthParser().convertBackward('abc')).to.haveProperties({
        success: false,
      });
    });
  });

  test('convertForward', () => {
    should('stringify numbers correctly', () => {
      assert(lengthParser().convertForward(123.45)).to.haveProperties({
        result: '123.45',
        success: true,
      });
    });

    should('stringify lengths with suffixes correctly', () => {
      assert(lengthParser().convertForward('123.45rem')).to.haveProperties({
        result: '123.45rem',
        success: true,
      });
    });
  });
});