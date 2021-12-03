import {source} from 'grapevine';
import {assert, createSpySubject, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {fromEvent, Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {getEl} from '../testing/get-el';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ocall} from './call';


const $elValue$ = source(() => new Subject<Event>());

const $host = {
  shadow: {
    el: id('el', DIV, {
      fn: ocall('dispatchEvent', instanceofType(Event)),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {

  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.fn()),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="el"></div>',
});

test('@persona/src/output/call', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('call the function correctly', () => {
      const host = _.tester.createElement(HOST);

      const eventName = 'event-name';
      const el = getEl(host, 'el')!;
      const spy = createSpySubject(fromEvent(el, eventName));

      const event = new CustomEvent(eventName);
      $elValue$.get(_.tester.vine).next(event);

      assert(spy).to.emitSequence([event]);
    });
  });
});