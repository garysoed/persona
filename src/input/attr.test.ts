import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {reverse} from 'nabu';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {integer} from '../stringify/integer';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {iattr} from './attr';


const $hostValue$ = source(() => new ReplaySubject<string|null>());
const $elValue$ = source(() => new ReplaySubject<string|null>());
const $shadowValue$ = source(() => new Subject<string|null>());

const $hostIntegerValue$ = source(() => new ReplaySubject<number|null>());
const $elIntegerValue$ = source(() => new ReplaySubject<number|null>());
const $shadowIntegerValue$ = source(() => new Subject<number|null>());

const $host = {
  host: {
    value: iattr('attr'),
    valueInt: iattr('attr-int', reverse(integer())),
  },
  shadow: {
    el: query('#el', DIV, {
      value: iattr('attr'),
      valueInt: iattr('attr-int', reverse(integer())),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.value.pipe(
          tap(value => $hostValue$.get(this.context.vine).next(value)),
      ),
      this.context.shadow.el.value.pipe(
          tap(value => $elValue$.get(this.context.vine).next(value)),
      ),
      this.context.host.valueInt.pipe(
          tap(value => $hostIntegerValue$.get(this.context.vine).next(value)),
      ),
      this.context.shadow.el.valueInt.pipe(
          tap(value => $elIntegerValue$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="el"></div>',
});

const $shadow = {
  shadow: {
    deps: query('#deps', HOST),
  },
};

class ShadowCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $shadow>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $shadowValue$.get(this.context.vine).pipe(this.context.shadow.deps.value()),
      $shadowIntegerValue$.get(this.context.vine).pipe(this.context.shadow.deps.valueInt()),
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


test('@persona/src/input/attr', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', () => {
      const value = 'value';
      const element = _.tester.createElement(HOST);
      element.setAttribute('attr', value);
      element.removeAttribute('attr');

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([null, value, null]);
    });

    should('handle custom parser', () => {
      const element = _.tester.createElement(HOST);
      element.setAttribute('attr-int', '12');
      element.removeAttribute('attr-int');

      assert($hostIntegerValue$.get(_.tester.vine)).to.emitSequence([null, 12, null]);
    });
  });

  test('el', () => {
    should('update values correctly', () => {
      const value = 'value';
      const rootEl = _.tester.createElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      element.setAttribute('attr', value);
      element.removeAttribute('attr');

      assert($elValue$.get(_.tester.vine)).to.emitSequence([null, value, null]);
    });

    should('update values with custom parser correctly', () => {
      const rootEl = _.tester.createElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      element.setAttribute('attr-int', '12');
      element.removeAttribute('attr-int');

      assert($elIntegerValue$.get(_.tester.vine)).to.emitSequence([null, 12, null]);
    });
  });

  test('shadow', () => {
    should('emit values on set', () => {
      const value = 'value';
      _.tester.createElement(SHADOW);

      $shadowValue$.get(_.tester.vine).next(value);
      $shadowValue$.get(_.tester.vine).next(null);
      assert($hostValue$.get(_.tester.vine)).to.emitSequence([null, value, null]);
    });

    should('emit values on set with custom parser', () => {
      const value = 12;
      _.tester.createElement(SHADOW);

      $shadowIntegerValue$.get(_.tester.vine).next(value);
      $shadowIntegerValue$.get(_.tester.vine).next(null);
      assert($hostIntegerValue$.get(_.tester.vine)).to.emitSequence([null, value, null]);
    });
  });
});