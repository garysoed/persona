import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ostyle} from './style';

const $elValue$ = source(() => new Subject<string>());

const $host = {
  shadow: {
    el: query('#el', DIV, {
      value: ostyle('height'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<div id="el"></div>',
});

test('@persona/src/output/style', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens'));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('set the style correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);

      await asyncAssert(snapshotElement(element)).to.match('style__el_empty');

      $elValue$.get(_.tester.vine).next('123px');
      await asyncAssert(snapshotElement(element)).to.match('style__el_value');
    });
  });
});
