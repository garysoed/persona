import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
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

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="el"></div>',
});


test('@persona/src/output/style', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('set the style correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('style__el_empty.golden');

      $elValue$.get(_.tester.vine).next('123px');
      assert(snapshotElement(element)).to.match('style__el_value.golden');
    });
  });
});
