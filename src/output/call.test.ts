import {source} from 'grapevine';
import {assert, createSpy, createSpySubject, fake, should, spy, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {instanceofType, numberType} from 'gs-types';
import {fromEvent, Observable, of, Subject} from 'rxjs';
import {map, take} from 'rxjs/operators';

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
  constructor(private readonly context: Context<typeof $host>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.context.vine).pipe(
          map(el => [el]),
          this.context.shadow.el.fn(),
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

test('@persona/src/output/call', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('call the function correctly', () => {
      const host = _.tester.createElement(HOST);

      const eventName = 'event-name';
      const el = getHarness(host, '#el', ElementHarness).target;
      const spy = createSpySubject(fromEvent(el, eventName));

      const event = new CustomEvent(eventName);
      $elValue$.get(_.tester.vine).next(event);

      assert(spy).to.emitSequence([event]);
    });

    should('update values correctly if target is not initialized on time', async () => {
      const onWhenDefined$ = new Subject<CustomElementConstructor>();
      fake(spy(window.customElements, 'whenDefined')).always()
          .return(onWhenDefined$ as any);

      const key = 'key';
      const output = ocall(key, [numberType]);
      const tag = 'tag';
      const target = document.createElement(tag);

      const value = 123;
      const onUpdate = of([456], [value]).pipe(output.resolve(target)(), take(1)).toPromise();

      const calledSpy = createSpy(`${key}Spy`);
      (target as any)[key] = calledSpy;
      onWhenDefined$.next(HTMLElement);

      await onUpdate;

      assert(calledSpy).to.haveBeenCalledWith(value);
    });
  });
});