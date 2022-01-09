import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {triggerFakeMutation} from '../testing/fake-mutation-observer';
import {getEl} from '../testing/get-el';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oclass} from './class';
import goldens from './goldens/goldens.json';


const $hostValue$ = source(() => new Subject<boolean>());
const $elValue$ = source(() => new Subject<boolean>());
const $shadowValue$ = source(() => new ReplaySubject<boolean>());

const CLASS_NAME = 'class-name';

const $host = {
  host: {
    value: oclass(CLASS_NAME),
  },
  shadow: {
    el: id('el', DIV, {
      value: oclass(CLASS_NAME),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(
          this.context.host.value()),
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


test('@persona/src/output/class', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element.classList.contains(CLASS_NAME)).to.beFalse();

      $hostValue$.get(_.tester.vine).next(true);
      assert(element.classList.contains(CLASS_NAME)).to.beTrue();

      $hostValue$.get(_.tester.vine).next(false);
      assert(element.classList.contains(CLASS_NAME)).to.beFalse();
    });
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('class__el_empty.html');

      $elValue$.get(_.tester.vine).next(true);
      assert(element).to.matchSnapshot('class__el_value.html');

      $elValue$.get(_.tester.vine).next(false);
      assert(element).to.matchSnapshot('class__el_reset.html');
    });
  });

  test('shadow', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(SHADOW);

      $hostValue$.get(_.tester.vine).next(true);
      triggerFakeMutation(getEl(element, '#deps')!, {});
      assert($shadowValue$.get(_.tester.vine)).to.emitSequence([false, true]);
    });
  });
});
