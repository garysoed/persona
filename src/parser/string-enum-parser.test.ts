import {assert, should, test, setup} from 'gs-testing';
import {failure, success} from 'nabu';

import {stringEnumParser} from './string-enum-parser';

enum Test {
  A = 'a',
}

test('@persona/src/parser/string-enum-parser', () => {
  const _ = setup(() => {
    const converter = stringEnumParser<Test>(Test, 'Test');
    return {converter};
  });

  test('convertBackward', () => {
    should('convert successfully', () => {
      assert(_.converter.convertBackward(Test.A)).to.haveProperties(
        success('a'),
      );
    });
  });

  test('convertForward', () => {
    should('convert enum values successfully', () => {
      assert(_.converter.convertForward('a')).to.haveProperties(
        success(Test.A),
      );
    });

    should('return failure if the value is not an enum', () => {
      assert(_.converter.convertForward('abc')).to.haveProperties(failure());
    });
  });
});
