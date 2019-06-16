import { assert, match, setup, should, test } from '@gs-testing';
import { createFakeWindow } from '../testing/fake-window';
import { LocationService, LocationSpec, Route } from './location-service';
interface TestRoutes extends LocationSpec {
  'default': {};
  'notexist': {};
  'pathA': {a: string};
  'pathB': {b: string};
  'pathC': {n: string};
}

test('@persona/location/location-service', () => {
  let service: LocationService<TestRoutes>;
  let fakeWindow: Window;

  setup(() => {
    fakeWindow = createFakeWindow();

    service = new LocationService(
        [
          {path: '/a/:a', type: 'pathA'},
          {path: '/b/:b?', type: 'pathB'},
          {path: '/:n', type: 'pathC'},
          {path: '/default', type: 'default'},
        ],
        {payload: {}, type: 'default'},
        fakeWindow,
    );
  });

  test('getLocation', () => {
    should(`emit the first matching path`, () => {
      fakeWindow.history.pushState({}, '', '/a/abc');

      assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({a: 'abc'}),
            type: 'pathA',
          }),
      );
    });

    should(`match optional parameters`, () => {
      fakeWindow.history.pushState({}, '', '/b/abc');

      assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({b: 'abc'}),
            type: 'pathB',
          }),
      );
    });

    should(`match optional parameters when omitted`, () => {
      fakeWindow.history.pushState({}, '', '/b/');

      assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({b: ''}),
            type: 'pathB',
          }),
      );
    });

    should(`emit the default path if none of the specs match`, () => {
      fakeWindow.history.pushState({}, '', '/un/match');

      assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({}),
            type: 'default',
          }),
      );

      assert(fakeWindow.location.pathname).to.equal(`/default`);
    });
  });

  test('getLocationOfType', () => {
    should(`emit the location if it has the correct type`, () => {
      fakeWindow.history.pushState({}, '', '/a/abc');

      assert(service.getLocationOfType('pathA')).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({a: 'abc'}),
            type: 'pathA',
          }),
      );
    });

    should(`emit null if location is of the wrong type`, () => {
      fakeWindow.history.pushState({}, '', '/b/abc');

      assert(service.getLocationOfType('pathA')).to.emitWith(null);
    });
  });

  test('goToPath', () => {
    should(`push the history correctly`, () => {
      const a = '123';

      service.goToPath('pathA', {a});

      assert(fakeWindow.location.pathname).to.equal(`/a/${a}`);
    });

    should(`throw error if the type cannot be found`, () => {
      assert(() => service.goToPath('notexist', {})).to.throwErrorWithMessage(/not found/);
    });
  });
});
