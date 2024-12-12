import {source} from 'grapevine';
import {
  assert,
  asyncAssert,
  runEnvironment,
  setup,
  should,
  test,
} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
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

import {oclass} from './class';

const $hostValue$ = source(() => new Subject<boolean>());
const $elValue$ = source(() => new Subject<boolean>());
const $shadowValue$ = source(() => new ReplaySubject<boolean>());

const CLASS_NAME = 'class-name';

const $host = {
  host: {
    value: oclass(CLASS_NAME),
  },
  shadow: {
    el: query('#el', DIV, {
      value: oclass(CLASS_NAME),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.value()),
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
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
      this.context.shadow.deps.value.pipe(
        tap((value) => $shadowValue$.get(this.context.vine).next(value)),
      ),
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

test('@persona/src/output/class', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens'));
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(element.classList.contains(CLASS_NAME)).to.beFalse();

      $hostValue$.get(_.tester.vine).next(true);
      assert(element.classList.contains(CLASS_NAME)).to.beTrue();

      $hostValue$.get(_.tester.vine).next(false);
      assert(element.classList.contains(CLASS_NAME)).to.beFalse();
    });
  });

  test('el', () => {
    should('update values correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);

      await asyncAssert(snapshotElement(element)).to.match('class__el_empty');

      $elValue$.get(_.tester.vine).next(true);
      await asyncAssert(snapshotElement(element)).to.match('class__el_value');

      $elValue$.get(_.tester.vine).next(false);
      await asyncAssert(snapshotElement(element)).to.match('class__el_reset');
    });
  });

  test('shadow', () => {
    should('update values correctly', async () => {
      const element = _.tester.bootstrapElement(SHADOW);

      $hostValue$.get(_.tester.vine).next(true);
      getHarness(element, '#deps', ElementHarness).simulateMutation();
      await asyncAssert($shadowValue$.get(_.tester.vine)).to.emitSequence([
        false,
        true,
      ]);
    });
  });
});
