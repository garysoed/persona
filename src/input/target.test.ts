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

import {itarget} from './target';


const $elValue$ = source(() => new ReplaySubject<Element>());

const $host = {
  shadow: {
    el: id('el', DIV, {
      target: itarget(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.el.target.pipe(
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


test('@persona/src/input/target', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const rootEl = _.tester.createElement(HOST);
      const element = getEl(rootEl, '#el')!;

      assert($elValue$.get(_.tester.vine)).to.emitSequence([element]);
    });
  });
});