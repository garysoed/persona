import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {flattenNode} from '../../src/testing/flatten-node';
import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {osingle} from '../output/single';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderNode} from './types/render-node-spec';


const $elValue$ = source(() => new Subject<Node|null>());


const $host = {
  shadow: {
    el: id('el', DIV, {
      value: osingle('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.$.vine).pipe(
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
  template: '<div id="el"><!-- #ref --></div>',
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

      assert(flattenNode(element)).to.matchSnapshot('render-node__el_empty');

      const node = document.createTextNode('text');
      $elValue$.get(_.tester.vine).next(node);
      assert(flattenNode(element)).to.matchSnapshot('render-node__el_value');

      $elValue$.get(_.tester.vine).next(null);
      assert(flattenNode(element)).to.matchSnapshot('render-node__el_reset');
    });
  });
});
