import {assert, should, test, setup} from 'gs-testing';
import {Observable} from 'rxjs';

import {setupTest} from '../testing/setup-test';
import {Ctrl} from '../types/ctrl';

import {registerCustomElement} from './register-custom-element';


class TestClassCtrl implements Ctrl {
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}
const TEST_CLASS_SPEC = registerCustomElement({
  tag: 'test-el',
  ctrl: TestClassCtrl,
  template: '',
  spec: {},
});

test('@persona/src/core/functional', () => {
  const _ = setup(() => {
    const tester = setupTest({
      roots: [TEST_CLASS_SPEC],
    });

    return {tester};
  });

  should('set up the component correctly', () => {
    const element = _.tester.bootstrapElement(TEST_CLASS_SPEC);
    assert(element).to.beAnInstanceOf(TEST_CLASS_SPEC.$ctor.get(_.tester.vine));
  });
});
