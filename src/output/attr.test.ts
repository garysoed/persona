import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {integer} from '../stringify/number';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oattr} from './attr';
import goldens from './goldens/goldens.json';


const $hostValue$ = source(() => new Subject<string|null>());
const $elValue$ = source(() => new Subject<string|null>());
const $shadowValue$ = source(() => new ReplaySubject<string|null>());

const $hostIntegerValue$ = source(() => new Subject<number|null>());
const $elIntegerValue$ = source(() => new Subject<number|null>());
const $shadowIntegerValue$ = source(() => new ReplaySubject<number|null>());


const $host = {
  host: {
    value: oattr('attr'),
    valueInt: oattr('attr-int', integer()),
  },
  shadow: {
    el: query('#el', DIV, {
      value: oattr('attr'),
      valueInt: oattr('attr-int', integer()),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.value()),
      $hostIntegerValue$.get(this.context.vine).pipe(this.context.host.valueInt()),
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
      $elIntegerValue$.get(this.context.vine).pipe(this.context.shadow.el.valueInt()),
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
      this.context.shadow.deps.value.pipe(
          tap(value => $shadowValue$.get(this.context.vine).next(value)),
      ),
      this.context.shadow.deps.valueInt.pipe(
          tap(value => $shadowIntegerValue$.get(this.context.vine).next(value)),
      ),
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


test('@persona/src/output/attr', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', () => {
      const value = 'value';
      const element = _.tester.createElement(HOST);

      assert(element.getAttribute('attr')).to.beNull();

      $hostValue$.get(_.tester.vine).next(value);
      assert(element.getAttribute('attr')).to.equal(value);

      $hostValue$.get(_.tester.vine).next(null);
      assert(element.hasAttribute('attr')).to.beFalse();
    });

    should('update values with custom parsers correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element.getAttribute('attr-int')).to.beNull();

      $hostIntegerValue$.get(_.tester.vine).next(12);
      assert(element.getAttribute('attr-int')).to.equal('12');

      $hostIntegerValue$.get(_.tester.vine).next(null);
      assert(element.hasAttribute('attr-int')).to.beFalse();
    });
  });

  test('el', () => {
    should('update values correctly', () => {
      const value = 'value';
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('attr__el_empty.html');

      $elValue$.get(_.tester.vine).next(value);
      assert(element).to.matchSnapshot('attr__el_value.html');

      $elValue$.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('attr__el_reset.html');
    });

    should('update values with custom parsers correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('attr__el_integer_empty.html');

      $elIntegerValue$.get(_.tester.vine).next(12);
      assert(element).to.matchSnapshot('attr__el_integer_value.html');

      $elIntegerValue$.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('attr__el_integer_reset.html');
    });
  });

  test('shadow', () => {
    should('update values correctly', () => {
      const value = 'value';
      _.tester.createElement(SHADOW);

      $hostValue$.get(_.tester.vine).next(value);
      assert($shadowValue$.get(_.tester.vine)).to.emitSequence([null, value]);
    });

    should('update values with custom parsers correctly', () => {
      const value = 12;
      _.tester.createElement(SHADOW);

      $hostIntegerValue$.get(_.tester.vine).next(value);
      assert($shadowIntegerValue$.get(_.tester.vine)).to.emitSequence([null, value]);
    });
  });
});
