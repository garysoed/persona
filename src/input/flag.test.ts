import {source} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
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
    el: query('#el', DIV, {
      value: iflag('attr'),
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

test('@persona/src/input/flag', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', async () => {
      const element = _.tester.bootstrapElement(HOST);
      element.setAttribute('attr', '');
      element.removeAttribute('attr');

      await asyncAssert($hostValue$.get(_.tester.vine)).to.emitSequence([
        false,
        true,
        false,
      ]);
    });
  });

  test('el', () => {
    should('update values correctly', async () => {
      const rootEl = _.tester.bootstrapElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      element.setAttribute('attr', '');
      element.removeAttribute('attr');

      await asyncAssert($elValue$.get(_.tester.vine)).to.emitSequence([
        false,
        true,
        false,
      ]);
    });
  });

  test('shadow', () => {
    should('emit values on set', async () => {
      _.tester.bootstrapElement(SHADOW);

      $shadowValue$.get(_.tester.vine).next(true);
      $shadowValue$.get(_.tester.vine).next(false);
      await asyncAssert($hostValue$.get(_.tester.vine)).to.emitSequence([
        false,
        true,
        false,
      ]);
    });
  });
});
