import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {stringType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {RenderSpec} from '../../export';
import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {renderNode} from '../render/types/render-node-spec';
import {id} from '../selector/id';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oforeach} from './foreach';
import goldens from './goldens/goldens.json';


interface Renderer {
  render: (tag: string) => RenderSpec;
}

const $elValue$ = source(() => new Subject<readonly string[]>());
const $rootValue$ = source(() => new Subject<readonly string[]>());
const $renderer = source<Renderer>(() => ({
  render: (tag: string): RenderSpec => {
    return renderNode({node: document.createElement(tag)});
  },
}));


const $host = {
  shadow: {
    root: root({
      value: oforeach('#root', stringType),
    }),
    el: id('el', DIV, {
      value: oforeach('#ref', stringType),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.$.vine).pipe(
          this.$.shadow.el.value(value => this.renderNode(value)),
      ),
      $rootValue$.get(this.$.vine).pipe(
          this.$.shadow.root.value(value => this.renderNode(value)),
      ),
    ];
  }

  renderNode(tag: string): Observable<RenderSpec> {
    return of($renderer.get(this.$.vine).render(tag));
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #root --><div id="el"><!-- #ref --></div>',
});

test('@persona/src/output/foreach', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('root', _, () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.createElement(HOST);

      $rootValue$.get(_.tester.vine).next(['div1', 'div2', 'div3']);

      assert(element).to.matchSnapshot('foreach__root_init.html');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $rootValue$.get(_.tester.vine).next(['node1', node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(element).to.matchSnapshot('foreach__root_insert_start.html');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(element).to.matchSnapshot('foreach__root_insert_middle.html');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(element).to.matchSnapshot('foreach__root_insert_end.html');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      $rootValue$.get(_.tester.vine).next([node1, node3]);

      assert(element).to.matchSnapshot('foreach__root_delete.html');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $rootValue$.get(_.tester.vine).next([node1]);
      $rootValue$.get(_.tester.vine).next([node2]);

      assert(element).to.matchSnapshot('foreach__root_same_id.html');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.createElement(HOST);
      const node = 'div';
      $rootValue$.get(_.tester.vine).next([node, node]);

      $rootValue$.get(_.tester.vine).next([]);

      assert(element).to.matchSnapshot('foreach__root_delete_duplicate.html');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $rootValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(element).to.matchSnapshot('foreach__root_set.html');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.createElement(HOST);
      const id = 'div';

      $rootValue$.get(_.tester.vine).next([id]);
      assert(element).to.matchSnapshot('foreach__root_multi_insert.html');

      $rootValue$.get(_.tester.vine).next([]);
      assert(element).to.matchSnapshot('foreach__root_multi_delete.html');
    });
  });

  test('el', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      assert(element).to.matchSnapshot('foreach__el_init.html');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(element).to.matchSnapshot('foreach__el_insert_start.html');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(element).to.matchSnapshot('foreach__el_insert_middle.html');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(element).to.matchSnapshot('foreach__el_insert_end.html');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      $elValue$.get(_.tester.vine).next([node1, node3]);

      assert(element).to.matchSnapshot('foreach__el_delete.html');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $elValue$.get(_.tester.vine).next([node1]);
      $elValue$.get(_.tester.vine).next([node2]);

      assert(element).to.matchSnapshot('foreach__el_same_id.html');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.createElement(HOST);
      const node = 'div';
      $elValue$.get(_.tester.vine).next([node, node]);

      $elValue$.get(_.tester.vine).next([]);

      assert(element).to.matchSnapshot('foreach__el_delete_duplicate.html');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.createElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $elValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(element).to.matchSnapshot('foreach__el_set.html');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.createElement(HOST);
      const id = 'div';

      $elValue$.get(_.tester.vine).next([id]);
      assert(element).to.matchSnapshot('foreach__el_multi_insert.html');

      $elValue$.get(_.tester.vine).next([]);
      assert(element).to.matchSnapshot('foreach__el_multi_delete.html');
    });
  });
});
