import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {renderNode} from '../render/types/render-node-spec';
import {RenderSpec} from '../render/types/render-spec';
import {id} from '../selector/id';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {omulti} from './multi';


const $elValue$ = source(() => new Subject<readonly RenderSpec[]>());
const $rootValue$ = source(() => new Subject<readonly RenderSpec[]>());


const $host = {
  shadow: {
    root: root({
      value: omulti('#root'),
    }),
    el: id('el', DIV, {
      value: omulti('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.$.vine).pipe(this.$.shadow.el.value()),
      $rootValue$.get(this.$.vine).pipe(this.$.shadow.root.value()),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #root --><div id="el"><!-- #ref --></div>',
});

test('@persona/src/output/multi', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('root', _, () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});

      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      assert(element).to.matchSnapshot('multi__root_init.html');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});

      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = renderNode({id: {}, node: document.createElement('div0')});
      $rootValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(element).to.matchSnapshot('multi__root_insert_start.html');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = renderNode({id: {}, node: document.createElement('div0')});
      $rootValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(element).to.matchSnapshot('multi__root_insert_middle.html');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = renderNode({id: {}, node: document.createElement('div0')});
      $rootValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(element).to.matchSnapshot('multi__root_insert_end.html');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      $rootValue$.get(_.tester.vine).next([node1, node3]);

      assert(element).to.matchSnapshot('multi__root_delete.html');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: '1', node: document.createElement('div1')});
      const node2 = renderNode({id: '1', node: document.createElement('div2')});

      $rootValue$.get(_.tester.vine).next([node1]);
      $rootValue$.get(_.tester.vine).next([node2]);

      assert(element).to.matchSnapshot('multi__root_same_id.html');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.createElement(HOST);
      const node = renderNode({id: {}, node: document.createElement('div')});
      $rootValue$.get(_.tester.vine).next([node, node]);

      $rootValue$.get(_.tester.vine).next([]);

      assert(element).to.matchSnapshot('multi__root_delete_duplicate.html');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = renderNode({id: {}, node: document.createElement('div0')});
      $rootValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(element).to.matchSnapshot('multi__root_set.html');
    });
  });

  test('el', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      assert(element).to.matchSnapshot('multi__el_init.html');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = renderNode({id: {}, node: document.createElement('div0')});
      $elValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(element).to.matchSnapshot('multi__el_insert_start.html');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = renderNode({id: {}, node: document.createElement('div0')});
      $elValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(element).to.matchSnapshot('multi__el_insert_middle.html');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = renderNode({id: {}, node: document.createElement('div0')});
      $elValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(element).to.matchSnapshot('multi__el_insert_end.html');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      $elValue$.get(_.tester.vine).next([node1, node3]);

      assert(element).to.matchSnapshot('multi__el_delete.html');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: '1', node: document.createElement('div1')});
      const node2 = renderNode({id: '1', node: document.createElement('div2')});

      $elValue$.get(_.tester.vine).next([node1]);
      $elValue$.get(_.tester.vine).next([node2]);

      assert(element).to.matchSnapshot('multi__el_same_id.html');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.createElement(HOST);
      const node = renderNode({id: {}, node: document.createElement('div')});
      $elValue$.get(_.tester.vine).next([node, node]);

      $elValue$.get(_.tester.vine).next([]);

      assert(element).to.matchSnapshot('multi__el_delete_duplicate.html');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.createElement(HOST);
      const node1 = renderNode({id: {}, node: document.createElement('div1')});
      const node2 = renderNode({id: {}, node: document.createElement('div2')});
      const node3 = renderNode({id: {}, node: document.createElement('div3')});
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = renderNode({id: {}, node: document.createElement('div0')});
      $elValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(element).to.matchSnapshot('multi__el_set.html');
    });
  });
});
