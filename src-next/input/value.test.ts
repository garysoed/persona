import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {numberType} from 'gs-types';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ivalue} from './value';


const $value$ = source(() => new ReplaySubject<number|undefined>());
const $valueWithDefault$ = source(() => new ReplaySubject<number>());

const DEFAULT_VALUE = 3;

const $ = {
  host: {
    value: ivalue('value', numberType),
    valueWithDefault: ivalue('valueWithDefault', numberType, DEFAULT_VALUE),
  },
};

class TestCtrl implements Ctrl {
  constructor(
      private readonly context: Context<typeof $>,
  ) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.value.pipe(
          tap(value => $value$.get(this.context.vine).next(value)),
      ),
      this.context.host.valueWithDefault.pipe(
          tap(value => $valueWithDefault$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  tag: 'test-el',
  ctrl: TestCtrl,
  deps: [],
  spec: $,
  template: '',
});

test('@persona/src/input/value', init => {
  const _ = init(() => {
    const tester = setupTest({
      roots: [TEST],
    });

    return {tester};
  });

  should('emit values on sets when default values are given', () => {
    const value = 2;
    const element = _.tester.createElement(TEST);
    element.value = value;
    element.value = undefined;

    assert($value$.get(_.tester.vine)).to.emitSequence([undefined, value, undefined]);
  });

  should('emit values on sets when default values aren\'t given', () => {
    const value = 2;
    const element = _.tester.createElement(TEST);
    element.valueWithDefault = value;

    assert($valueWithDefault$.get(_.tester.vine)).to.emitSequence([DEFAULT_VALUE, value]);
  });
});