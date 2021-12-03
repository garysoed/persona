import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {numberType} from 'gs-types';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {icall} from './call';


const $hostValue$ = source(() => new ReplaySubject<number>());
const $shadowValue$ = source(() => new Subject<number>());

const $host = {
  host: {
    fn: icall('fn', numberType),
  },
};

class HostCtrl implements Ctrl {
  constructor(
      private readonly context: Context<typeof $host>,
  ) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.fn.pipe(
          tap(value => $hostValue$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement<typeof $host>({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '',
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
      $shadowValue$.get(this.context.vine).pipe(this.context.shadow.deps.fn()),
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


test('@persona/src/input/call', init => {
  const _ = init(() => {
    const tester = setupTest({
      roots: [SHADOW],
    });

    return {tester};
  });

  test('host', () => {
    should('emit values on calls', () => {
      const value = 2;
      const element = _.tester.createElement(HOST);
      element.fn(value);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([value]);
    });
  });

  test('shadow', () => {
    should('emit values on calls', () => {
      const value = 2;
      _.tester.createElement(SHADOW);
      $shadowValue$.get(_.tester.vine).next(value);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([value]);
    });
  });
});