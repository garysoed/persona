import { assert, objectThat, run, should, spy, test } from 'gs-testing';
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
    run(service.run());
    return {service, fakeWindow};
  });

  test('getLocation', () => {
    should(`emit the first matching path`, () => {
      _.fakeWindow.history.pushState({}, '', '/a/123');

      assert(_.service.getLocation()).to.emitWith(
          objectThat<Route<typeof SPEC, 'pathA'>>().haveProperties({
            payload: objectThat<{a: number}>().haveProperties({a: 123}),
            type: 'pathA',
          }),
      );
    });

    should(`emit and go to the default path if none of the specs match`, () => {
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
            payload: objectThat<{a: number}>().haveProperties({a: 123}),
            type: 'pathA',
          }),
      );
    });

    should(`emit null if location is of the wrong type`, () => {
      _.fakeWindow.history.pushState({}, '', '/b/abc');

      assert(_.service.getLocationOfType('pathA')).to.emitWith(null);
    });
  });

  test('goToPath', () => {
    should(`push the history correctly`, () => {
      const a = 123;

      _.service.goToPath('pathA', {a});

      assert(_.fakeWindow.location.pathname).to.equal(`/a/${a}`);
    });
  });

  test('interceptLinks', () => {
    should(`intercept click events from child of anchor elements`, () => {
      const codeEl = document.createElement('code');
      const anchorEl = document.createElement('a');
      anchorEl.href = '/a/123';
      anchorEl.appendChild(codeEl);
      const rootEl = document.createElement('div');
      rootEl.appendChild(anchorEl);

      run(_.service.interceptLinks(rootEl));
      const event = new CustomEvent('click', {bubbles: true});
      const preventDefaultSpy = spy(event, 'preventDefault');
      codeEl.dispatchEvent(event);

      assert(preventDefaultSpy).to.haveBeenCalledWith();
      assert(_.fakeWindow.location.pathname).to.equal(`/a/123`);
    });

    should(`not intercept if location results in invalid route`, () => {
      const anchorEl = document.createElement('a');
      anchorEl.href = '/unmatch';

      run(_.service.interceptLinks(anchorEl));
      const event = new CustomEvent('click', {bubbles: true});
      const preventDefaultSpy = spy(event, 'preventDefault');
      anchorEl.dispatchEvent(event);

      assert(preventDefaultSpy).toNot.haveBeenCalledWith();
      assert(_.fakeWindow.location.pathname).to.equal('');
    });

    should(`not intercept if the anchor element's target is _blank`, () => {
      const anchorEl = document.createElement('a');
      anchorEl.href = '/unmatch';
      anchorEl.target = '_blank';

      run(_.service.interceptLinks(anchorEl));
      const event = new CustomEvent('click', {bubbles: true});
      const preventDefaultSpy = spy(event, 'preventDefault');
      anchorEl.dispatchEvent(event);

      assert(preventDefaultSpy).toNot.haveBeenCalledWith();
      assert(_.fakeWindow.location.pathname).to.equal('');
    });
  });

  test('parseLocation', () => {
    should(`return the first matching path`, () => {
      _.fakeWindow.history.pushState({}, '', '/a/123');

      assert(_.service.getLocation()).to.emitWith(
          objectThat<Route<typeof SPEC, 'pathA'>>().haveProperties({
            payload: objectThat<{a: number}>().haveProperties({a: 123}),
            type: 'pathA',
          }),
      );
    });

    should(`return null if none of the specs match`, () => {
      _.fakeWindow.history.pushState({}, '', '/un/match');

      assert(_.service.getLocation()).to.emitWith(
          objectThat<Route<typeof SPEC, 'default'>>().haveProperties({
            payload: objectThat().haveProperties({}),
            type: 'default',
          }),
      );
    });
  });
});
