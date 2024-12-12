import {source} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {createSpyObservable} from 'gs-testing/src/spy/spy';
import {cached} from 'gs-tools/export/data';
import {fromEvent, Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oevent} from './event';

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

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [$hostValue$.get(this.context.vine).pipe(this.context.host.event())];
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
      this.context.shadow.deps.event.pipe(
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

test('@persona/src/output/event', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);

      const event$ = createSpyObservable(fromEvent(element, EVENT_NAME));
      const event = new CustomEvent(EVENT_NAME);
      $hostValue$.get(_.tester.vine).next(event);

      await asyncAssert(event$).to.emitSequence([event]);
    });
  });

  test('shadow', () => {
    should('update values correctly', async () => {
      _.tester.bootstrapElement(SHADOW);
      const event = new CustomEvent(EVENT_NAME);

      $hostValue$.get(_.tester.vine).next(event);
      await asyncAssert($shadowValue$.get(_.tester.vine)).to.emitSequence([
        event,
      ]);
    });
  });
});
