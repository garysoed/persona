import {source} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {integerParser} from '../parser/integer-parser';
import {query} from '../selector/query';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {iattr} from './attr';

const $hostValue$ = source(() => new ReplaySubject<string | null>());
const $elValue$ = source(() => new ReplaySubject<string | null>());
const $shadowValue$ = source(() => new Subject<string | null>());

const $hostIntegerValue$ = source(() => new ReplaySubject<number | null>());
const $elIntegerValue$ = source(() => new ReplaySubject<number | null>());
const $shadowIntegerValue$ = source(() => new Subject<number | null>());

const $host = {
  host: {
    value: iattr('attr'),
    valueInt: iattr('attr-int', integerParser()),
  },
  shadow: {
    el: query('#el', DIV, {
      value: iattr('attr'),
      valueInt: iattr('attr-int', integerParser()),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.value.pipe(
        tap((value) => $hostValue$.get(this.context.vine).next(value)),
      ),
      this.context.shadow.el.value.pipe(
        tap((value) => $elValue$.get(this.context.vine).next(value)),
      ),
      this.context.host.valueInt.pipe(
        tap((value) => $hostIntegerValue$.get(this.context.vine).next(value)),
      ),
      this.context.shadow.el.valueInt.pipe(
        tap((value) => $elIntegerValue$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<div id="el"></div>',
});

const $shadow = {
  shadow: {
    deps: query('#deps', HOST),
  },
};

class ShadowCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $shadow>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $shadowValue$
        .get(this.context.vine)
        .pipe(this.context.shadow.deps.value()),
      $shadowIntegerValue$
        .get(this.context.vine)
        .pipe(this.context.shadow.deps.valueInt()),
    ];
  }
}

const SHADOW = registerCustomElement({
  ctrl: ShadowCtrl,
  deps: [HOST],
  spec: $shadow,
  tag: 'test-shadow',
  template: '<test-host id="deps"></test-host>',
});

test('@persona/src/input/attr', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', async () => {
      const value = 'value';
      const element = _.tester.bootstrapElement(HOST);
      element.setAttribute('attr', value);
      element.removeAttribute('attr');

      await asyncAssert($hostValue$.get(_.tester.vine)).to.emitSequence([
        null,
        value,
        null,
      ]);
    });

    should('handle custom parser', async () => {
      const element = _.tester.bootstrapElement(HOST);
      element.setAttribute('attr-int', '12');
      element.removeAttribute('attr-int');

      await asyncAssert($hostIntegerValue$.get(_.tester.vine)).to.emitSequence([
        null,
        12,
        null,
      ]);
    });
  });

  test('el', () => {
    should('update values correctly', async () => {
      const value = 'value';
      const rootEl = _.tester.bootstrapElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      element.setAttribute('attr', value);
      element.removeAttribute('attr');

      await asyncAssert($elValue$.get(_.tester.vine)).to.emitSequence([
        null,
        value,
        null,
      ]);
    });

    should('update values with custom parser correctly', async () => {
      const rootEl = _.tester.bootstrapElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      element.setAttribute('attr-int', '12');
      element.removeAttribute('attr-int');

      await asyncAssert($elIntegerValue$.get(_.tester.vine)).to.emitSequence([
        null,
        12,
        null,
      ]);
    });
  });

  test('shadow', () => {
    should('emit values on set', async () => {
      const value = 'value';
      _.tester.bootstrapElement(SHADOW);

      $shadowValue$.get(_.tester.vine).next(value);
      $shadowValue$.get(_.tester.vine).next(null);
      await asyncAssert($hostValue$.get(_.tester.vine)).to.emitSequence([
        null,
        value,
        null,
      ]);
    });

    should('emit values on set with custom parser', async () => {
      const value = 12;
      _.tester.bootstrapElement(SHADOW);

      $shadowIntegerValue$.get(_.tester.vine).next(value);
      $shadowIntegerValue$.get(_.tester.vine).next(null);
      await asyncAssert($hostIntegerValue$.get(_.tester.vine)).to.emitSequence([
        null,
        value,
        null,
      ]);
    });
  });
});
