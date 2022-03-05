import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {createSpyObservable} from 'gs-testing/src/spy/spy';
import {cache} from 'gs-tools/export/data';
import {fromEvent, Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oevent} from './event';
import goldens from './goldens/goldens.json';


const $hostValue$ = source(() => new Subject<CustomEvent>());
const $shadowValue$ = source(() => new ReplaySubject<CustomEvent>());

const EVENT_NAME = 'event-name';

const $host = {
  host: {
    event: oevent(EVENT_NAME, CustomEvent),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.event()),
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
      this.context.shadow.deps.event.pipe(
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


test('@persona/src/output/event', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      const event$ = createSpyObservable(fromEvent(element, EVENT_NAME));
      const event = new CustomEvent(EVENT_NAME);
      $hostValue$.get(_.tester.vine).next(event);

      assert(event$).to.emitSequence([event]);
    });
  });

  test('shadow', () => {
    should('update values correctly', () => {
      _.tester.createElement(SHADOW);
      const event = new CustomEvent(EVENT_NAME);

      $hostValue$.get(_.tester.vine).next(event);
      assert($shadowValue$.get(_.tester.vine)).to.emitSequence([event]);
    });
  });
});
