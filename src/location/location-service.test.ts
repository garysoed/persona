import { assert, objectThat, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';

import { createFakeWindow } from '../testing/fake-window';
import { integerParser } from '../util/parsers';

import { fromPattern } from './location-converter';
import { LocationService, Route } from './location-service';


const SPEC = {
  default: fromPattern('/', {}),
  pathA: fromPattern('/a/:a', {a: integerParser()}),
};

test('@persona/location/location-service', init => {
  const _ = init(() => {
    const fakeWindow = createFakeWindow();

    const service = new LocationService(
        SPEC,
        {payload: {}, type: 'default'},
        observableOf(fakeWindow),
    );
    service.initialize().subscribe();
    return {service, fakeWindow};
  });

  test('getLocation', () => {
    should(`emit the first matching path`, () => {
      _.fakeWindow.history.pushState({}, '', '/a/123');

      assert(_.service.getLocation()).to.emitWith(
          objectThat<Route<typeof SPEC, 'pathA'>>().haveProperties({
            payload: objectThat().haveProperties({a: 123}),
            type: 'pathA',
          }),
      );
    });

    should(`emit the default path if none of the specs match`, () => {
      _.fakeWindow.history.pushState({}, '', '/un/match');

      assert(_.service.getLocation()).to.emitWith(
          objectThat<Route<typeof SPEC, 'default'>>().haveProperties({
            payload: objectThat().haveProperties({}),
            type: 'default',
          }),
      );

      assert(_.fakeWindow.location.pathname).to.equal(`/`);
    });
  });

  test('getLocationOfType', () => {
    should(`emit the location if it has the correct type`, () => {
      _.fakeWindow.history.pushState({}, '', '/a/123');

      assert(_.service.getLocationOfType('pathA')).to.emitWith(
          objectThat<Route<typeof SPEC, 'pathA'>>().haveProperties({
            payload: objectThat().haveProperties({a: 123}),
            type: 'pathA',
          }),
      );
    });

    should(`not emit if location is of the wrong type`, () => {
      _.fakeWindow.history.pushState({}, '', '/b/abc');

      assert(_.service.getLocationOfType('pathA')).toNot.emit();
    });
  });

  test('goToPath', () => {
    should(`push the history correctly`, () => {
      const a = 123;

      _.service.goToPath('pathA', {a});

      assert(_.fakeWindow.location.pathname).to.equal(`/a/${a}`);
    });
  });
});
