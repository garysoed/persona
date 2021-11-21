import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
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

import {iclass} from './class';


const $hostValue$ = source(() => new ReplaySubject<boolean>());
const $elValue$ = source(() => new ReplaySubject<boolean>());
const $shadowValue$ = source(() => new Subject<boolean>());

const CLASS_NAME = 'class-name';

const $host = {
  host: {
    value: iclass(CLASS_NAME),
  },
  shadow: {
    el: id('el', DIV, {
      value: iclass(CLASS_NAME),
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


test('@persona/src/input/class', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', () => {
      const element = _.tester.createElement(HOST);
      element.setAttribute('class', CLASS_NAME);
      element.removeAttribute('class');

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([false, true, false]);
    });
  });

  test('el', () => {
    should('update values correctly', () => {
      const rootEl = _.tester.createElement(HOST);
      const element = getEl(rootEl, 'el')!;
      element.setAttribute('class', CLASS_NAME);
      element.removeAttribute('class');

      assert($elValue$.get(_.tester.vine)).to.emitSequence([false, true, false]);
    });
  });

  test('shadow', () => {
    should('emit values on set', () => {
      const element = _.tester.createElement(SHADOW);

      $shadowValue$.get(_.tester.vine).next(true);
      triggerFakeMutation(getEl(element, 'deps')!, {});

      $shadowValue$.get(_.tester.vine).next(false);
      triggerFakeMutation(getEl(element, 'deps')!, {});

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([false, true, false]);
    });
  });
});