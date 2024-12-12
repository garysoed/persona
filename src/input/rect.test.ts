import {source} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {skip, tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {irect} from './rect';

const $elValue$ = source(() => new ReplaySubject<DOMRect>());

const $host = {
  shadow: {
    el: query('#el', DIV, {
      event: irect(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.el.event.pipe(
        tap((value) => $elValue$.get(this.context.vine).next(value)),
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

test('@persona/src/input/rect', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', async () => {
      const rootEl = _.tester.bootstrapElement(HOST);
      const harness = getHarness(rootEl, '#el', ElementHarness);

      const newRect = new DOMRect(1, 2, 3, 4);
      harness.simulateResize(newRect);

      await asyncAssert(
        $elValue$.get(_.tester.vine).pipe(skip(1)),
      ).to.emitSequence([newRect]);
    });
  });
});
