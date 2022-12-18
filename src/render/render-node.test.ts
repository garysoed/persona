import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderNode} from './types/render-node-spec';


const $elValue = source(() => new Subject<Node|null>());

const $host = {
  shadow: {
    el: root({
      value: ocase<Node|null>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue.get(this.$.vine).pipe(
          this.$.shadow.el.value(map(node => !node ? null : renderNode({node}))),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #ref -->',
});


test('@persona/src/output/render-node', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('render-node__el_empty.golden');

      const node = document.createTextNode('text');
      $elValue.get(_.tester.vine).next(node);
      assert(snapshotElement(element)).to.match('render-node__el_value.golden');

      $elValue.get(_.tester.vine).next(null);
      assert(snapshotElement(element)).to.match('render-node__el_reset.golden');
    });
  });
});
