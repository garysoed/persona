import {source} from 'grapevine';
import {asyncAssert, createSpySubject, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {fromEvent, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ocall} from './call';

const $elValue$ = source(() => new Subject<Event>());

const $host = {
  shadow: {
    el: query('#el', DIV, {
      fn: ocall('dispatchEvent', [instanceofType(Event)]),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.context.vine).pipe(
        map((el) => [el] satisfies [Event]),
        this.context.shadow.el.fn(),
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

test('@persona/src/output/call', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('call the function correctly', async () => {
      const host = _.tester.bootstrapElement(HOST);

      const eventName = 'event-name';
      const el = getHarness(host, '#el', ElementHarness).target;
      const spy = createSpySubject(fromEvent(el, eventName));

      const event = new CustomEvent(eventName);
      $elValue$.get(_.tester.vine).next(event);

      await asyncAssert(spy).to.emitSequence([event]);
    });
  });
});
