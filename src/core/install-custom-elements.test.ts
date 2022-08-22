import {assert, should, test, setup} from 'gs-testing';

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
  spec: {},
});

class TestClass implements Ctrl {
  readonly runs = [];
}

const TEST_CLASS = registerCustomElement({
  tag: 'test-el',
  ctrl: TestClass,
  deps: [DEPS_CLASS],
  spec: {},
  template: '',
});

test('@persona/src/core/install-custom-elements', () => {
  const _ = setup(() => {
    const tester = setupTest({
      roots: [TEST_CLASS],
    });

    return {tester};
  });

  should('install all components including the dependencies', () => {
    const element = _.tester.bootstrapElement(TEST_CLASS);
    const depsEl = _.tester.bootstrapElement(DEPS_CLASS);

    assert(element).to.beAnInstanceOf(TEST_CLASS.$ctor.get(_.tester.vine));
    assert(depsEl).to.beAnInstanceOf(DEPS_CLASS.$ctor.get(_.tester.vine));
  });
});
