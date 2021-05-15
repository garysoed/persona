import {assert, createSpySubject, run, should, test} from 'gs-testing';
import {fromEvent, Subject} from 'rxjs';

import {$div} from '../html/div';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {dispatcher} from './dispatcher';


test('output.dispatcher', init => {
  const EVENT_NAME = 'eventName';
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, $div, {
      dispatch: dispatcher('eventName'),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const output = $._.dispatch;

    return {output, context: createFakeContext({shadowRoot}), el};
  });

  test('output', () => {
    should('create observable that emits the dispatcher', async () => {
      const calledSubject = createSpySubject(fromEvent(_.el, 'eventName'));

      const event$ = new Subject<Event>();
      run(event$.pipe(_.output.output(_.context)));
      const event = new CustomEvent(EVENT_NAME);
      event$.next(event);

      assert(calledSubject).to.emitWith(event);
    });
  });
});
