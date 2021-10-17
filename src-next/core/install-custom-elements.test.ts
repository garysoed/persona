import {Vine} from 'grapevine';
import {assert, createSpyObject, should, test} from 'gs-testing';

import {Ctrl} from '../types/ctrl';

import {installCustomElements} from './install-custom-elements';
import {registerCustomElement} from './register-custom-element';


class DepsClass implements Ctrl {
  readonly runs = [];
}

const DEPS_CLASS = registerCustomElement({
  tag: 'deps-el',
  ctrl: DepsClass,
  template: '',
});

class TestClass implements Ctrl {
  readonly runs = [];
}

const TEST_CLASS = registerCustomElement({
  tag: 'test-el',
  ctrl: TestClass,
  deps: [DEPS_CLASS],
  template: '',
});

test('@persona/src/core/install-custom-elements', () => {
  should('install all components including the dependencies', () => {
    const vine = new Vine({appName: 'test'});
    const mockCustomElementRegistry = createSpyObject<CustomElementRegistry>('CustomElementRegistry', ['define']);
    const registrations = installCustomElements({
      customElementRegistry: mockCustomElementRegistry,
      roots: [TEST_CLASS],
      rootDoc: document,
      vine,
    });

    assert(registrations).to.haveExactElements([
      TEST_CLASS,
      DEPS_CLASS,
    ]);
  });
});
