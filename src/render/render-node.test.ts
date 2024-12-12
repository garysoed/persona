import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {renderNode} from './types/render-node-spec';

const $elValue = source(() => new Subject<Node | null>());

const $host = {
  shadow: {
    el: root({
      value: ocase<Node | null>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue
        .get(this.$.vine)
        .pipe(
          this.$.shadow.el.value(
            map((node) => (!node ? null : renderNode({node}))),
          ),
        ),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<!-- #ref -->',
});

test('@persona/src/output/render-node', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);

      await asyncAssert(snapshotElement(element)).to.match(
        'render-node__el_empty',
      );

      const node = document.createTextNode('text');
      $elValue.get(_.tester.vine).next(node);
      await asyncAssert(snapshotElement(element)).to.match(
        'render-node__el_value',
      );

      $elValue.get(_.tester.vine).next(null);
      await asyncAssert(snapshotElement(element)).to.match(
        'render-node__el_reset',
      );
    });
  });
});
