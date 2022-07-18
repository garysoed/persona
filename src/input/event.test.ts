import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Observable, ReplaySubject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ievent} from './event';


const $elValue$ = source(() => new ReplaySubject<Event>());
const $elValueStrict$ = source(() => new ReplaySubject<Event>());

const EVENT_NAME = 'event-name';

const $host = {
  shadow: {
    el: query('#el', DIV, {
      event: ievent(EVENT_NAME, CustomEvent),
      eventStrict: ievent(EVENT_NAME, CustomEvent, {matchTarget: true}),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.el.event.pipe(forwardTo($elValue$.get(this.context.vine))),
      this.context.shadow.el.eventStrict.pipe(forwardTo($elValueStrict$.get(this.context.vine))),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="el"><div id="sub"></div></div>',
});


test('@persona/src/input/event', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('listen to events correctly', () => {
      const rootEl = _.tester.bootstrapElement(HOST);
      const element = getHarness(rootEl, '#el', ElementHarness).target;
      const event = new CustomEvent(EVENT_NAME);
      element.dispatchEvent(event);

      assert($elValue$.get(_.tester.vine)).to.emitSequence([event]);
      assert($elValueStrict$.get(_.tester.vine)).to.emitSequence([event]);
    });

    should('ignore events that do not match the target if matchTarget is true', () => {
      const rootEl = _.tester.bootstrapElement(HOST);
      const element = getHarness(rootEl, '#sub', ElementHarness).target;
      const event = new CustomEvent(EVENT_NAME, {bubbles: true});
      element.dispatchEvent(event);

      assert($elValue$.get(_.tester.vine)).to.emitSequence([event]);
      assert($elValueStrict$.get(_.tester.vine)).to.emitSequence([]);
    });

    should('ignore events that do not match the type', () => {
      const rootEl = _.tester.bootstrapElement(HOST);
      const element = getHarness(rootEl, '#sub', ElementHarness).target;
      const event = new KeyboardEvent(EVENT_NAME, {bubbles: true});
      element.dispatchEvent(event);

      assert($elValue$.get(_.tester.vine)).to.emitSequence([]);
      assert($elValueStrict$.get(_.tester.vine)).to.emitSequence([]);
    });
  });
});