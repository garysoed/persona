import { assert, objectThat, should, test } from 'gs-testing';

import { integerParser, stringParser } from '../util/parsers';

import { fromPattern } from './location-converter';


test('@persona/location/location-converter', () => {
  test('fromPattern', () => {
    test('convertBackward', () => {
      should(`pass if the location has the correct type`, () => {
        const converter = fromPattern('/:a/:b', {a: integerParser(), b: stringParser()});
        assert(converter.convertBackward({a: 1, b: 'blah'})).to.equal(
            objectThat().haveProperties({
              success: true,
              result: '/1/blah',
            }),
        );
      });
    });

    test('convertForward', () => {
      should(`parse the URL correctly`, () => {
        const converter = fromPattern('/:a/:b', {a: integerParser(), b: stringParser()});
        assert(converter.convertForward('/1/blah')).to.equal(
            objectThat().haveProperties({
              success: true,
              result: objectThat().haveProperties({a: 1, b: 'blah'}),
            }),
        );
      });

      should(`fail if one of the params cannot be converted`, () => {
        const converter = fromPattern('/:a/:b', {a: integerParser(), b: stringParser()});
        assert(converter.convertForward('/a/blah')).to.equal(
            objectThat().haveProperties({success: false}),
        );
      });

      should(`match optional params`, () => {
        const converter = fromPattern('/:a/:b?', {a: integerParser(), b: stringParser()});
        assert(converter.convertForward('/1/blah')).to.equal(
            objectThat().haveProperties({
              success: true,
              result: objectThat().haveProperties({a: 1, b: 'blah'}),
            }),
        );
      });

      should(`match optional param when omitted`, () => {
        const converter = fromPattern('/:a/:b?', {a: integerParser(), b: stringParser()});
        assert(converter.convertForward('/1/')).to.equal(
            objectThat().haveProperties({
              success: true,
              result: objectThat().haveProperties({a: 1}),
            }),
        );
      });

      should(`fail if it does not match`, () => {
        const converter = fromPattern('/:a/:b', {a: integerParser(), b: stringParser()});
        assert(converter.convertForward('/1/')).to.equal(
            objectThat().haveProperties({success: false}),
        );
      });
    });
  });
});
