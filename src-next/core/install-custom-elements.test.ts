import {assert, should, test} from 'gs-testing';

import {setupTest} from '../testing/setup-test';
import {Ctrl} from '../types/ctrl';

import {registerCustomElement} from './register-custom-element';


class DepsClass implements Ctrl {
  readonly runs = [];
}

const DEPS_CLASS = registerCustomElement({
  tag: 'deps-el',
  ctrl: DepsClass,
  template: '',
  spec: {host: {}},
});

class TestClass implements Ctrl {
  readonly runs = [];
}

const TEST_CLASS = registerCustomElement({
  tag: 'test-el',
  ctrl: TestClass,
  deps: [DEPS_CLASS],
  spec: {host: {}},
  template: '',
});

test('@persona/src/core/install-custom-elements', init => {
  const _ = init(() => {
    const tester = setupTest({
      roots: [TEST_CLASS],
    });

    return {tester};
  });

  should('install all components including the dependencies', () => {
    const element = _.tester.createElement(TEST_CLASS);
    const depsEl = _.tester.createElement(DEPS_CLASS);

    assert(element).to.beAnInstanceOf(TEST_CLASS.get(_.tester.vine));
    assert(depsEl).to.beAnInstanceOf(DEPS_CLASS.get(_.tester.vine));
  });
});
