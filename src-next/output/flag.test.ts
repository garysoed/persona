import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {flattenNode} from '../../src/testing/flatten-node';
import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oflag} from './flag';
import elEmptyGolden from './goldens/flag__el_empty.html';
import elResetGolden from './goldens/flag__el_reset.html';
import elValueGolden from './goldens/flag__el_value.html';


const $hostValue$ = source(() => new Subject<boolean>());
const $elValue$ = source(() => new Subject<boolean>());
const $shadowValue$ = source(() => new ReplaySubject<boolean>());


const $host = {
  host: {
    value: oflag('has-attr'),
  },
  shadow: {
    el: id('el', DIV, {
      value: oflag('has-attr'),
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
    runEnvironment(new BrowserSnapshotsEnv(
        'src-next/output/goldens',
        {
          'flag__el_empty.html': elEmptyGolden,
          'flag__el_reset.html': elResetGolden,
          'flag__el_value.html': elValueGolden,
        },
    ));
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element.hasAttribute('has-attr')).to.beFalse();

      $hostValue$.get(_.tester.vine).next(true);
      assert(element.hasAttribute('has-attr')).to.beTrue();

      $hostValue$.get(_.tester.vine).next(false);
      assert(element.hasAttribute('has-attr')).to.beFalse();
    });
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(flattenNode(element)).to.matchSnapshot('flag__el_empty.html');

      $elValue$.get(_.tester.vine).next(true);
      assert(flattenNode(element)).to.matchSnapshot('flag__el_value.html');

      $elValue$.get(_.tester.vine).next(false);
      assert(flattenNode(element)).to.matchSnapshot('flag__el_reset.html');
    });
  });

  test('shadow', () => {
    should('update values correctly', () => {
      _.tester.createElement(SHADOW);

      $hostValue$.get(_.tester.vine).next(true);
      assert($shadowValue$.get(_.tester.vine)).to.emitSequence([false, true]);
    });
  });
});
