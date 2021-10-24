import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {numberType} from 'gs-types';
import {Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ovalue} from './value';


const $value$ = source(() => new Subject<number|undefined>());
const $valueWithDefault$ = source(() => new Subject<number>());

const DEFAULT_VALUE = 3;

const $ = {
  host: {
    value: ovalue('value', numberType),
    valueWithDefault: ovalue('valueWithDefault', numberType, DEFAULT_VALUE),
  },
};

class TestCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $>) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $value$.get(this.context.vine).pipe(this.context.host.value()),
      $valueWithDefault$.get(this.context.vine).pipe(this.context.host.valueWithDefault()),
    ];
  }
}

const TEST = registerCustomElement({
  tag: 'test-el',
  ctrl: TestCtrl,
  spec: $,
  template: '',
});

test('@persona/src/output/value', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('update values correctly if the default value is given', () => {
    const value = 2;
    const element = _.tester.createElement(TEST);

    assert(element.valueWithDefault).to.equal(DEFAULT_VALUE);

    $valueWithDefault$.get(_.tester.vine).next(value);
    assert(element.valueWithDefault).to.equal(value);
  });

  should('update values correctly if the default value is not given', () => {
    const value = 2;
    const element = _.tester.createElement(TEST);

    assert(element.value).toNot.beDefined();

    $value$.get(_.tester.vine).next(value);
    assert(element.value).to.equal(value);
  });
});