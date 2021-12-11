import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {nullType, numberType, unionType} from 'gs-types';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ivalue} from './value';


const $hostValue$ = source(() => new ReplaySubject<number|null|undefined>());
const $hostValueWithDefault$ = source(() => new ReplaySubject<number|null>());
const $shadowValue$ = source(() => new Subject<number|null|undefined>());
const $shadowValueWithDefault$ = source(() => new Subject<number|null>());

const DEFAULT_VALUE = 3;
const VALUE_TYPE = unionType([numberType, nullType]);

const $host = {
  host: {
    value: ivalue('value', VALUE_TYPE),
    valueWithDefault: ivalue('valueWithDefault', VALUE_TYPE, DEFAULT_VALUE),
  },
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
  ctrl: HostCtrl,
  spec: $host,
  template: '',
});

const $shadow = {
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

    should('handle null values', () => {
      const element = _.tester.createElement(HOST);
      element.value = null;
      element.value = undefined;

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, null, undefined]);
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

    should('handle null values', () => {
      _.tester.createElement(SHADOW);
      $shadowValue$.get(_.tester.vine).next(null);
      $shadowValue$.get(_.tester.vine).next(undefined);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, null, undefined]);
    });
  });
});