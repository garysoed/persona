import { assert, should, test } from '@gs-testing/main';
import { createSpySubject } from '@gs-testing/spy';
import { InstanceofType } from 'gs-types/export';
import { fromEvent, Subject } from 'rxjs';
import { element } from '../input/element';
import { dispatcher, DispatcherOutput } from './dispatcher';

test('output.dispatcher', () => {
  const EVENT_NAME = 'eventName';
  const ELEMENT_ID = 'test';
  let output: DispatcherOutput<Event>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      dispatch: dispatcher('eventName'),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.dispatch;
  });

  test('output', () => {
    should(`create observable that emits the dispatcher`, async () => {
      const calledSubject = createSpySubject();
      fromEvent(el, 'eventName').subscribe(calledSubject);

      const eventSubject = new Subject<Event>();
      output.output(shadowRoot, eventSubject).subscribe();
      const event = new CustomEvent(EVENT_NAME);
      eventSubject.next(event);

      await assert(calledSubject).to.emitWith(event);
    });
  });
});