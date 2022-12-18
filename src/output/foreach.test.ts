import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject, OperatorFunction, pipe} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {renderNode} from '../render/types/render-node-spec';
import {RenderSpec} from '../render/types/render-spec';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oforeach} from './foreach';
import goldens from './goldens/goldens.json';


interface Renderer {
  render: (tag: string) => RenderSpec;
}

const $elValue$ = source(() => new Subject<readonly string[]>());
const $elSlotlessValue$ = source(() => new Subject<readonly string[]>());
const $rootValue$ = source(() => new Subject<readonly string[]>());
const $rootSlotlessValue$ = source(() => new Subject<readonly string[]>());
const $withIdValue$ = source(() => new Subject<ReadonlyArray<readonly string[]>>());

const $renderer = source<Renderer>(() => ({
  render: (tag: string): RenderSpec => {
    return renderNode({node: document.createElement(tag)});
  },
}));


const $host = {
  shadow: {
    root: root({
      value: oforeach<string>('#root'),
      slotless: oforeach<string>(),
      withId: oforeach<readonly string[]>('#withId', ([value]) => value),
    }),
    el: query('#el', DIV, {
      value: oforeach<string>('#ref'),
      slotless: oforeach<string>(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.$.vine).pipe(
          this.$.shadow.el.value(this.renderNode()),
      ),
      $elSlotlessValue$.get(this.$.vine).pipe(
          this.$.shadow.el.slotless(this.renderNode()),
      ),
      $rootValue$.get(this.$.vine).pipe(
          this.$.shadow.root.value(this.renderNode()),
      ),
      $rootSlotlessValue$.get(this.$.vine).pipe(
          this.$.shadow.root.slotless(this.renderNode()),
      ),
      $withIdValue$.get(this.$.vine).pipe(
          this.$.shadow.root.withId(pipe(map(([value]) => value), this.renderNode())),
      ),
    ];
  }

  renderNode(): OperatorFunction<string, RenderSpec> {
    return map(tag => $renderer.get(this.$.vine).render(tag));
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #root --><div id="el"><!-- #ref --></div><!-- #withId -->',
});

test('@persona/src/output/foreach', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('root', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      $rootValue$.get(_.tester.vine).next(['div1', 'div2', 'div3']);

      assert(snapshotElement(element)).to.match('foreach__root_init.golden');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $rootValue$.get(_.tester.vine).next(['node1', node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_insert_start.golden');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_insert_middle.golden');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(snapshotElement(element)).to.match('foreach__root_insert_end.golden');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      $rootValue$.get(_.tester.vine).next([node1, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_delete.golden');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $rootValue$.get(_.tester.vine).next([node1]);
      $rootValue$.get(_.tester.vine).next([node2]);

      assert(snapshotElement(element)).to.match('foreach__root_same_id.golden');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $rootValue$.get(_.tester.vine).next([node, node]);

      $rootValue$.get(_.tester.vine).next([]);

      assert(snapshotElement(element)).to.match('foreach__root_delete_duplicate.golden');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $rootValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_set.golden');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.bootstrapElement(HOST);
      const id = 'div';

      $rootValue$.get(_.tester.vine).next([id]);
      assert(snapshotElement(element)).to.match('foreach__root_multi_insert.golden');

      $rootValue$.get(_.tester.vine).next([]);
      assert(snapshotElement(element)).to.match('foreach__root_multi_delete.golden');
    });
  });

  test('root slotless', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      $rootSlotlessValue$.get(_.tester.vine).next(['div1', 'div2', 'div3']);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_init.golden');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $rootSlotlessValue$.get(_.tester.vine).next(['node1', node2, node3]);

      const insertNode = 'div0';
      $rootSlotlessValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_insert_start.golden');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_insert_middle.golden');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_insert_end.golden');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      $rootSlotlessValue$.get(_.tester.vine).next([node1, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_delete.golden');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $rootSlotlessValue$.get(_.tester.vine).next([node1]);
      $rootSlotlessValue$.get(_.tester.vine).next([node2]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_same_id.golden');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $rootSlotlessValue$.get(_.tester.vine).next([node, node]);

      $rootSlotlessValue$.get(_.tester.vine).next([]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_delete_duplicate.golden');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $rootSlotlessValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__root_slotless_set.golden');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.bootstrapElement(HOST);
      const id = 'div';

      $rootSlotlessValue$.get(_.tester.vine).next([id]);
      assert(snapshotElement(element)).to.match('foreach__root_slotless_multi_insert.golden');

      $rootSlotlessValue$.get(_.tester.vine).next([]);
      assert(snapshotElement(element)).to.match('foreach__root_slotless_multi_delete.golden');
    });
  });

  test('el', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_init.golden');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_insert_start.golden');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_insert_middle.golden');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(snapshotElement(element)).to.match('foreach__el_insert_end.golden');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      $elValue$.get(_.tester.vine).next([node1, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_delete.golden');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $elValue$.get(_.tester.vine).next([node1]);
      $elValue$.get(_.tester.vine).next([node2]);

      assert(snapshotElement(element)).to.match('foreach__el_same_id.golden');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $elValue$.get(_.tester.vine).next([node, node]);

      $elValue$.get(_.tester.vine).next([]);

      assert(snapshotElement(element)).to.match('foreach__el_delete_duplicate.golden');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $elValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_set.golden');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.bootstrapElement(HOST);
      const id = 'div';

      $elValue$.get(_.tester.vine).next([id]);
      assert(snapshotElement(element)).to.match('foreach__el_multi_insert.golden');

      $elValue$.get(_.tester.vine).next([]);
      assert(snapshotElement(element)).to.match('foreach__el_multi_delete.golden');
    });
  });

  test('el slotless', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_init.golden');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elSlotlessValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_insert_start.golden');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_insert_middle.golden');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_insert_end.golden');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      $elSlotlessValue$.get(_.tester.vine).next([node1, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_delete.golden');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $elSlotlessValue$.get(_.tester.vine).next([node1]);
      $elSlotlessValue$.get(_.tester.vine).next([node2]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_same_id.golden');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $elSlotlessValue$.get(_.tester.vine).next([node, node]);

      $elSlotlessValue$.get(_.tester.vine).next([]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_delete_duplicate.golden');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $elSlotlessValue$.get(_.tester.vine).next([setNode, node2, node3]);

      assert(snapshotElement(element)).to.match('foreach__el_slotless_set.golden');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.bootstrapElement(HOST);
      const id = 'div';

      $elSlotlessValue$.get(_.tester.vine).next([id]);
      assert(snapshotElement(element)).to.match('foreach__el_slotless_multi_insert.golden');

      $elSlotlessValue$.get(_.tester.vine).next([]);
      assert(snapshotElement(element)).to.match('foreach__el_slotless_multi_delete.golden');
    });
  });

  test('withId', () => {
    should('process \'init\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      $withIdValue$.get(_.tester.vine).next([['div1'], ['div2'], ['div3']]);

      assert(snapshotElement(element)).to.match('foreach__with_id_init.golden');
    });

    should('process \'insert\' correctly for index 0', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const harness = getHarness(element, ElementHarness);
      const node1Before = harness.target.shadowRoot!.querySelector('div1');
      const node2Before = harness.target.shadowRoot!.querySelector('div2');
      const node3Before = harness.target.shadowRoot!.querySelector('div3');

      const insertNode = 'div0';
      $withIdValue$.get(_.tester.vine).next([[insertNode], [node1], [node2], [node3]]);
      const node1After = harness.target.shadowRoot!.querySelector('div1');
      const node2After = harness.target.shadowRoot!.querySelector('div2');
      const node3After = harness.target.shadowRoot!.querySelector('div3');

      // Check that the other nodes were not removed.
      assert(node1After).to.equal(node1Before);
      assert(node2After).to.equal(node2Before);
      assert(node3After).to.equal(node3Before);
      assert(snapshotElement(element)).to.match('foreach__with_id_insert_start.golden');
    });

    should('process \'insert\' correctly for index 2', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const insertNode = 'div0';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [insertNode], [node3]]);

      assert(snapshotElement(element)).to.match('foreach__with_id_insert_middle.golden');
    });

    should('process \'insert\' correctly for large index', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const insertNode = 'div0';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3], [insertNode]]);

      assert(snapshotElement(element)).to.match('foreach__with_id_insert_end.golden');
    });

    should('process \'delete\' correctly', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      $withIdValue$.get(_.tester.vine).next([[node1], [node3]]);

      assert(snapshotElement(element)).to.match('foreach__with_id_delete.golden');
    });

    should('ignore node insertions with the same id', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $withIdValue$.get(_.tester.vine).next([[node1]]);
      $withIdValue$.get(_.tester.vine).next([[node2]]);

      assert(snapshotElement(element)).to.match('foreach__with_id_same_id.golden');
    });

    should('handle deleting duplicates', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $withIdValue$.get(_.tester.vine).next([[node], [node]]);

      $withIdValue$.get(_.tester.vine).next([]);

      assert(snapshotElement(element)).to.match('foreach__with_id_delete_duplicate.golden');
    });

    should('replace the element correctly for \'set\'', () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const setNode = 'div0';
      $withIdValue$.get(_.tester.vine).next([[setNode], [node2], [node3]]);

      assert(snapshotElement(element)).to.match('foreach__with_id_set.golden');
    });

    should('handle insertion and deletions of renders with multiple nodes', () => {
      $renderer.get(_.tester.vine).render = value => {
        const node = document.createDocumentFragment();
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        node.appendChild(document.createElement(value));
        return renderNode({node});
      };

      const element = _.tester.bootstrapElement(HOST);
      const id = 'div';

      $withIdValue$.get(_.tester.vine).next([[id]]);
      assert(snapshotElement(element)).to.match('foreach__with_id_multi_insert.golden');

      $withIdValue$.get(_.tester.vine).next([]);
      assert(snapshotElement(element)).to.match('foreach__with_id_multi_delete.golden');
    });
  });
});
