import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {numberType} from 'gs-types';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl, CtrlCtor} from '../types/ctrl';

import {ivalue} from './value';


const $hostValue$ = source(() => new ReplaySubject<number|undefined>());
const $hostValueWithDefault$ = source(() => new ReplaySubject<number>());
const $shadowValue$ = source(() => new Subject<number|undefined>());
const $shadowValueWithDefault$ = source(() => new Subject<number>());

const DEFAULT_VALUE = 3;

const $host = {
  host: {
    value: ivalue('value', numberType),
    valueWithDefault: ivalue('valueWithDefault', numberType, DEFAULT_VALUE),
  },
  shadow: {},
};

class HostCtrl implements Ctrl {
  constructor(
      private readonly context: Context<typeof $host>,
  ) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.value.pipe(
          tap(value => $hostValue$.get(this.context.vine).next(value)),
      ),
      this.context.host.valueWithDefault.pipe(
          tap(value => $hostValueWithDefault$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement<typeof $host>({
  tag: 'test-host',
  ctrl: HostCtrl as CtrlCtor<typeof $host>,
  spec: $host,
  template: '',
});

const $shadow = {
  host: {},
  shadow: {
    deps: id('deps', HOST),
  },
};

class ShadowCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $shadow>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $shadowValue$.get(this.context.vine).pipe(this.context.shadow.deps.value()),
      $shadowValueWithDefault$.get(this.context.vine)
          .pipe(this.context.shadow.deps.valueWithDefault()),
    ];
  }
}

const SHADOW = registerCustomElement({
  tag: 'test-shadow',
  ctrl: ShadowCtrl,
  spec: $shadow,
  template: '<test-host id="deps"></test-host>',
  deps: [HOST],
});


test('@persona/src/input/value', init => {
  const _ = init(() => {
    const tester = setupTest({
      roots: [SHADOW],
    });

    return {tester};
  });

  test('host', () => {
    should('emit values on sets when default values are given', () => {
      const value = 2;
      const element = _.tester.createElement(HOST);
      element.valueWithDefault = value;

      assert($hostValueWithDefault$.get(_.tester.vine)).to.emitSequence([DEFAULT_VALUE, value]);
    });

    should('emit values on sets when default values aren\'t given', () => {
      const value = 2;
      const element = _.tester.createElement(HOST);
      element.value = value;
      element.value = undefined;

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, value, undefined]);
    });
  });

  test('shadow', () => {
    should('emit values on sets when default values are given', () => {
      const value = 2;
      _.tester.createElement(SHADOW);
      $shadowValueWithDefault$.get(_.tester.vine).next(value);

      assert($hostValueWithDefault$.get(_.tester.vine)).to.emitSequence([DEFAULT_VALUE, value]);
    });

    should('emit values on sets when default values aren\'t given', () => {
      const value = 2;
      _.tester.createElement(SHADOW);
      $shadowValue$.get(_.tester.vine).next(value);
      $shadowValue$.get(_.tester.vine).next(undefined);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, value, undefined]);
    });
  });
});