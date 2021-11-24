import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {flattenNode} from '../../src/testing/flatten-node';
import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {renderNode} from '../render/types/render-node-spec';
import {id} from '../selector/id';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {osingle} from './single';


const $elValue$ = source(() => new Subject<Node|null>());
const $rootValue$ = source(() => new Subject<Node|null>());


const $host = {
  shadow: {
    root: root({
      value: osingle('#root'),
    }),
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
      $rootValue$.get(this.$.vine).pipe(
          map(node => !node ? null : renderNode({id: node, node})),
          this.$.shadow.root.value(),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #root --><div id="el"><!-- #ref --></div>',
});


test('@persona/src/output/single', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(flattenNode(element)).to.matchSnapshot('single__el_empty.html');

      const node = document.createTextNode('text');
      $elValue$.get(_.tester.vine).next(node);
      assert(flattenNode(element)).to.matchSnapshot('single__el_value.html');

      $elValue$.get(_.tester.vine).next(null);
      assert(flattenNode(element)).to.matchSnapshot('single__el_reset.html');
    });
  });

  test('root', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(flattenNode(element)).to.matchSnapshot('single__root_empty.html');

      const node = document.createTextNode('text');
      $rootValue$.get(_.tester.vine).next(node);
      assert(flattenNode(element)).to.matchSnapshot('single__root_value.html');

      $rootValue$.get(_.tester.vine).next(null);
      assert(flattenNode(element)).to.matchSnapshot('single__root_reset.html');
    });
  });
});
