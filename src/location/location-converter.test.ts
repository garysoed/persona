import {assert, objectThat, should, test} from 'gs-testing';
import {identity, Result} from 'nabu';

import {integerParser} from '../parser/integer-parser';

import {fromPattern} from './location-converter';

test('@persona/src/location/location-converter', () => {
  test('fromPattern', () => {
    test('convertBackward', () => {
      should('pass if the location has the correct type', () => {
        const converter = fromPattern('/:a/:b', {
          a: integerParser(),
          b: identity<string>(),
        });
        assert(converter.convertBackward({a: 1, b: 'blah'})).to.equal(
          objectThat<Result<string>>().haveProperties({
            result: '/1/blah',
            success: true,
          }),
        );
      });
    });

    test('convertForward', () => {
      interface TestData {
        readonly a: number;
        readonly b: string;
      }

      should('parse the URL correctly', () => {
        const converter = fromPattern('/:a/:b', {
          a: integerParser(),
          b: identity<string>(),
        });
        assert(converter.convertForward('/1/blah')).to.equal(
          objectThat<Result<TestData>>().haveProperties({
            result: objectThat<TestData>().haveProperties({a: 1, b: 'blah'}),
            success: true,
          }),
        );
      });

      should('fail if one of the params cannot be converted', () => {
        const converter = fromPattern('/:a/:b', {
          a: integerParser(),
          b: identity<string>(),
        });
        assert(converter.convertForward('/a/blah')).to.equal(
          objectThat<Result<TestData>>().haveProperties({success: false}),
        );
      });

      should('match optional params', () => {
        const converter = fromPattern('/:a/:b?', {
          a: integerParser(),
          b: identity<string>(),
        });
        assert(converter.convertForward('/1/blah')).to.equal(
          objectThat<Result<TestData>>().haveProperties({
            result: objectThat<TestData>().haveProperties({a: 1, b: 'blah'}),
            success: true,
          }),
        );
      });

      should('match optional param when omitted', () => {
        const converter = fromPattern('/:a/:b?', {
          a: integerParser(),
          b: identity<string>(),
        });
        assert(converter.convertForward('/1/')).to.equal(
          objectThat<Result<TestData>>().haveProperties({
            result: objectThat<TestData>().haveProperties({a: 1}),
            success: true,
          }),
        );
      });

      should('fail if it does not match', () => {
        const converter = fromPattern('/:a/:b', {
          a: integerParser(),
          b: identity<string>(),
        });
        assert(converter.convertForward('/1/')).to.equal(
          objectThat<Result<TestData>>().haveProperties({success: false}),
        );
      });
    });
  });
});
