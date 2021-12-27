import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oattr} from './attr';
import goldens from './goldens/goldens.json';


const $hostValue$ = source(() => new Subject<string|null>());
const $elValue$ = source(() => new Subject<string|null>());
const $shadowValue$ = source(() => new ReplaySubject<string|null>());


const $host = {
  host: {
    value: oattr('attr'),
  },
  shadow: {
    el: id('el', DIV, {
      value: oattr('attr'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.value()),
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
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
    deps: id('deps', HOST),
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
  });

  test('shadow', () => {
    should('update values correctly', () => {
      const value = 'value';
      _.tester.createElement(SHADOW);

      $hostValue$.get(_.tester.vine).next(value);
      assert($shadowValue$.get(_.tester.vine)).to.emitSequence([null, value]);
    });
  });
});
