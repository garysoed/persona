import { assert, createSpyInstance, createSpyObject, match, setup, should, SpyObj, test } from '@gs-testing';
import { mixinDomListenable } from '../testing/mixin-dom-listenable';
import { LocationService, Route } from './location-service';

interface TestRoutes {
  'default': {};
  'notexist': {};
  'pathA': {a: string};
  'pathB': {b: string};
  'pathC': {n: string};
}

test('@persona/location/location-service', () => {
  let service: LocationService<TestRoutes>;
  let mockHistory: SpyObj<History>;
  let mockLocation: {pathname: string};

  setup(() => {
    mockHistory = createSpyInstance(History);
    mockLocation = {pathname: ''};
    const mockWindow = mixinDomListenable(
        Object.assign(
            createSpyObject<Window>('Window', []),
            {history: mockHistory, location: mockLocation},
        ),
    );

    service = new LocationService(
        [
          {path: '/a/:a', type: 'pathA'},
          {path: '/b/:b?', type: 'pathB'},
          {path: '/:n', type: 'pathC'},
          {path: '/default', type: 'default'},
        ],
        {payload: {}, type: 'default'},
        mockWindow,
    );
  });

  test('getLocation', () => {
    should(`emit the first matching path`, async () => {
      mockLocation.pathname = '/a/abc';

      await assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({a: 'abc'}),
            type: 'pathA',
          }),
      );
    });

    should(`match optional parameters`, async () => {
      mockLocation.pathname = '/b/abc';

      await assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({b: 'abc'}),
            type: 'pathB',
          }),
      );
    });

    should(`match optional parameters when omitted`, async () => {
      mockLocation.pathname = '/b/';

      await assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({b: ''}),
            type: 'pathB',
          }),
      );
    });

    should(`emit the default path if none of the specs match`, async () => {
      mockLocation.pathname = '/un/match';

      await assert(service.getLocation()).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({}),
            type: 'default',
          }),
      );

      assert(mockHistory.pushState).to.haveBeenCalledWith(
          match.anyObjectThat().haveProperties({}),
          'TODO',
          `/default`,
      );
    });
  });

  test('getLocationOfType', () => {
    should(`emit the location if it has the correct type`, async () => {
      mockLocation.pathname = '/a/abc';

      await assert(service.getLocationOfType('pathA')).to.emitWith(
          match.anyObjectThat<Route<TestRoutes, 'pathA'>>().haveProperties({
            payload: match.anyObjectThat().haveProperties({a: 'abc'}),
            type: 'pathA',
          }),
      );
    });

    should(`emit null if location is of the wrong type`, async () => {
      mockLocation.pathname = '/b/abc';

      await assert(service.getLocationOfType('pathA')).to.emitWith(null);
    });
  });

  test('goToPath', () => {
    should(`push the history correctly`, () => {
      const a = '123';

      service.goToPath('pathA', {a});

      assert(mockHistory.pushState).to.haveBeenCalledWith(
          match.anyObjectThat().haveProperties({}),
          'TODO',
          `/a/${a}`,
      );
    });

    should(`throw error if the type cannot be found`, () => {
      assert(() => service.goToPath('notexist', {})).to.throwErrorWithMessage(/not found/);
    });
  });
});
