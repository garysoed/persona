import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {getEl} from '../testing/get-el';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {iresize} from './resize';


const $elValue$ = source(() => new ReplaySubject<Pick<ResizeObserverEntry, 'contentRect'>>());

const $host = {
  shadow: {
    el: id('el', DIV, {
      event: iresize(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.el.event.pipe(
          tap(value => $elValue$.get(this.context.vine).next(value)),
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


test('@persona/src/input/resize', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const rootEl = _.tester.createElement(HOST);
      const element = getEl(rootEl, 'el')!;

      const record1 = {contentRect: new DOMRect(1, 2, 3, 4)};
      const record2 = {contentRect: new DOMRect(5, 6, 7, 8)};
      element.simulateResize([record1, record2]);

      assert($elValue$.get(_.tester.vine)).to.emitSequence([record1, record2]);
    });
  });
});