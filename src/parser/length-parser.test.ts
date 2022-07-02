import {assert, should, test} from 'gs-testing';
import {failure, success} from 'nabu';

import {lengthParser} from './length-parser';

test('@persona/src/parser/length-parser', () => {
  test('convertBackward', () => {
    should('stringify numbers correctly', () => {
      assert(lengthParser().convertBackward(123.45)).to.haveProperties(success('123.45'));
    });

    should('stringify lengths with suffixes correctly', () => {
      assert(lengthParser().convertBackward('123.45rem')).to.haveProperties(success('123.45rem'));
    });
  });

  test('convertForward', () => {
    should('parse numbers correctly', () => {
      assert(lengthParser().convertForward('123.45')).to.haveProperties(success(123.45));
    });

    should('parse lengths with suffixes correctly', () => {
      assert(lengthParser().convertForward('123.45rem')).to.haveProperties(success('123.45rem'));
    });

    should('fail if not a length', () => {
      assert(lengthParser().convertForward('abc')).to.haveProperties(failure());
    });
  });
});