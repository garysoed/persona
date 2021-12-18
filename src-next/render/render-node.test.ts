import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {osingle} from '../output/single';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderNode} from './types/render-node-spec';


const $elValue = source(() => new Subject<Node|null>());

const $host = {
  shadow: {
    el: root({
      value: osingle('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue.get(this.$.vine).pipe(
          map(node => !node ? null : renderNode({id: node, node})),
          this.$.shadow.el.value(),
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


test('@persona/src/output/render-node', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('render-node__el_empty.html');

      const node = document.createTextNode('text');
      $elValue.get(_.tester.vine).next(node);
      assert(element).to.matchSnapshot('render-node__el_value.html');

      $elValue.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('render-node__el_reset.html');
    });
  });
});
