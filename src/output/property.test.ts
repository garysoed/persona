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

import {oproperty} from './property';

const $value$ = source(() => new Subject<string>());

const $host = {
  shadow: {
    el: query('#el', DIV, {
      value: oproperty('--key'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [$value$.get(this.$.vine).pipe(this.$.shadow.el.value())];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<div id="el"></div>',
});

test('@persona/src/output/property', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens'));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('set the property value correctly', async () => {
    const element = _.tester.bootstrapElement(HOST);
    $value$.get(_.tester.vine).next('value');

    await asyncAssert(snapshotElement(element)).to.match('property');
  });
});
