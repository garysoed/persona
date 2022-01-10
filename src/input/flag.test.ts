import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {iflag} from './flag';


const $hostValue$ = source(() => new ReplaySubject<boolean>());
const $elValue$ = source(() => new ReplaySubject<boolean>());
const $shadowValue$ = source(() => new Subject<boolean>());


const $host = {
  host: {
    value: iflag('attr'),
  },
  shadow: {
    el: id('el', DIV, {
      value: iflag('attr'),
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
      $shadowValue$.get(this.context.vine).pipe(this.context.shadow.deps.value()),
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


test('@persona/src/input/flag', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', () => {
      const element = _.tester.createElement(HOST);
      element.setAttribute('attr', '');
      element.removeAttribute('attr');

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([false, true, false]);
    });
  });

  test('el', () => {
    should('update values correctly', () => {
      const rootEl = _.tester.createElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      element.setAttribute('attr', '');
      element.removeAttribute('attr');

      assert($elValue$.get(_.tester.vine)).to.emitSequence([false, true, false]);
    });
  });

  test('shadow', () => {
    should('emit values on set', () => {
      _.tester.createElement(SHADOW);

      $shadowValue$.get(_.tester.vine).next(true);
      $shadowValue$.get(_.tester.vine).next(false);
      assert($hostValue$.get(_.tester.vine)).to.emitSequence([false, true, false]);
    });
  });
});