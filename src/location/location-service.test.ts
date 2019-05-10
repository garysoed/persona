import { assert, createSpyInstance, createSpyObject, match, setup, should, SpyObj, test } from '@gs-testing';
import { mixinDomListenable } from '../testing/mixin-dom-listenable';
import { LocationService, Route } from './location-service';

interface TestRoutes {
  'default': {};
  'notexist': {};
  'pathA': {b: string};
  'pathB': {n: string};
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
          {path: '/a/:b', type: 'pathA'},
          {path: '/:n', type: 'pathB'},
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
            payload: match.anyObjectThat().haveProperties({b: 'abc'}),
            type: 'pathA',
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
    });
  });

  test('goToPath', () => {
    should(`push the history correctly`, () => {
      const b = '123';

      service.goToPath('pathA', {b});

      assert(mockHistory.pushState).to.haveBeenCalledWith(
          match.anyObjectThat().haveProperties({}),
          'TODO',
          `/a/${b}`,
      );
    });

    should(`throw error if the type cannot be found`, () => {
      assert(() => service.goToPath('notexist', {})).to.throwErrorWithMessage(/not found/);
    });
  });
});
