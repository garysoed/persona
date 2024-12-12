import {source} from 'grapevine';
import {
  assert,
  asyncAssert,
  runEnvironment,
  setup,
  should,
  test,
} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, OperatorFunction, pipe, Subject} from 'rxjs';
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

interface Renderer {
  render: (tag: string) => RenderSpec;
}

const $elValue$ = source(() => new Subject<readonly string[]>());
const $elSlotlessValue$ = source(() => new Subject<readonly string[]>());
const $rootValue$ = source(() => new Subject<readonly string[]>());
const $rootSlotlessValue$ = source(() => new Subject<readonly string[]>());
const $withIdValue$ = source(
  () => new Subject<ReadonlyArray<readonly string[]>>(),
);

const $renderer = source<Renderer>(() => ({
  render: (tag: string): RenderSpec => {
    return renderNode({node: document.createElement(tag)});
  },
}));

const $host = {
  shadow: {
    el: query('#el', DIV, {
      slotless: oforeach<string>(),
      value: oforeach<string>('#ref'),
    }),
    root: root({
      slotless: oforeach<string>(),
      value: oforeach<string>('#root'),
      withId: oforeach<readonly string[]>('#withId', ([value]) => value),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  renderNode(): OperatorFunction<string, RenderSpec> {
    return map((tag) => $renderer.get(this.$.vine).render(tag));
  }

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$
        .get(this.$.vine)
        .pipe(this.$.shadow.el.value(this.renderNode())),
      $elSlotlessValue$
        .get(this.$.vine)
        .pipe(this.$.shadow.el.slotless(this.renderNode())),
      $rootValue$
        .get(this.$.vine)
        .pipe(this.$.shadow.root.value(this.renderNode())),
      $rootSlotlessValue$
        .get(this.$.vine)
        .pipe(this.$.shadow.root.slotless(this.renderNode())),
      $withIdValue$.get(this.$.vine).pipe(
        this.$.shadow.root.withId(
          pipe(
            map(([value]) => value!),
            this.renderNode(),
          ),
        ),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<!-- #root --><div id="el"><!-- #ref --></div><!-- #withId -->',
});

test('@persona/src/output/foreach', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens'));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('root', () => {
    should("process 'init' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);

      $rootValue$.get(_.tester.vine).next(['div1', 'div2', 'div3']);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_init',
      );
    });

    should("process 'insert' correctly for index 0", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $rootValue$.get(_.tester.vine).next(['node1', node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_insert_start',
      );
    });

    should("process 'insert' correctly for index 2", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_insert_middle',
      );
    });

    should("process 'insert' correctly for large index", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_insert_end',
      );
    });

    should("process 'delete' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      $rootValue$.get(_.tester.vine).next([node1, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_delete',
      );
    });

    should('ignore node insertions with the same id', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $rootValue$.get(_.tester.vine).next([node1]);
      $rootValue$.get(_.tester.vine).next([node2]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_same_id',
      );
    });

    should('handle deleting duplicates', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $rootValue$.get(_.tester.vine).next([node, node]);

      $rootValue$.get(_.tester.vine).next([]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_delete_duplicate',
      );
    });

    should("replace the element correctly for 'set'", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $rootValue$.get(_.tester.vine).next([setNode, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match('foreach__root_set');
    });

    should(
      'handle insertion and deletions of renders with multiple nodes',
      async () => {
        $renderer.get(_.tester.vine).render = (value) => {
          const node = document.createDocumentFragment();
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          return renderNode({node});
        };

        const element = _.tester.bootstrapElement(HOST);
        const id = 'div';

        $rootValue$.get(_.tester.vine).next([id]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__root_multi_insert',
        );

        $rootValue$.get(_.tester.vine).next([]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__root_multi_delete',
        );
      },
    );
  });

  test('root slotless', () => {
    should("process 'init' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);

      $rootSlotlessValue$.get(_.tester.vine).next(['div1', 'div2', 'div3']);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_init',
      );
    });

    should("process 'insert' correctly for index 0", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $rootSlotlessValue$.get(_.tester.vine).next(['node1', node2, node3]);

      const insertNode = 'div0';
      $rootSlotlessValue$
        .get(_.tester.vine)
        .next([insertNode, node1, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_insert_start',
      );
    });

    should("process 'insert' correctly for index 2", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootSlotlessValue$
        .get(_.tester.vine)
        .next([node1, node2, insertNode, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_insert_middle',
      );
    });

    should("process 'insert' correctly for large index", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $rootSlotlessValue$
        .get(_.tester.vine)
        .next([node1, node2, node3, insertNode]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_insert_end',
      );
    });

    should("process 'delete' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      $rootSlotlessValue$.get(_.tester.vine).next([node1, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_delete',
      );
    });

    should('ignore node insertions with the same id', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $rootSlotlessValue$.get(_.tester.vine).next([node1]);
      $rootSlotlessValue$.get(_.tester.vine).next([node2]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_same_id',
      );
    });

    should('handle deleting duplicates', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $rootSlotlessValue$.get(_.tester.vine).next([node, node]);

      $rootSlotlessValue$.get(_.tester.vine).next([]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_delete_duplicate',
      );
    });

    should("replace the element correctly for 'set'", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $rootSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $rootSlotlessValue$.get(_.tester.vine).next([setNode, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__root_slotless_set',
      );
    });

    should(
      'handle insertion and deletions of renders with multiple nodes',
      async () => {
        $renderer.get(_.tester.vine).render = (value) => {
          const node = document.createDocumentFragment();
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          return renderNode({node});
        };

        const element = _.tester.bootstrapElement(HOST);
        const id = 'div';

        $rootSlotlessValue$.get(_.tester.vine).next([id]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__root_slotless_multi_insert',
        );

        $rootSlotlessValue$.get(_.tester.vine).next([]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__root_slotless_multi_delete',
        );
      },
    );
  });

  test('el', () => {
    should("process 'init' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match('foreach__el_init');
    });

    should("process 'insert' correctly for index 0", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([insertNode, node1, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_insert_start',
      );
    });

    should("process 'insert' correctly for index 2", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([node1, node2, insertNode, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_insert_middle',
      );
    });

    should("process 'insert' correctly for large index", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elValue$.get(_.tester.vine).next([node1, node2, node3, insertNode]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_insert_end',
      );
    });

    should("process 'delete' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      $elValue$.get(_.tester.vine).next([node1, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_delete',
      );
    });

    should('ignore node insertions with the same id', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $elValue$.get(_.tester.vine).next([node1]);
      $elValue$.get(_.tester.vine).next([node2]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_same_id',
      );
    });

    should('handle deleting duplicates', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $elValue$.get(_.tester.vine).next([node, node]);

      $elValue$.get(_.tester.vine).next([]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_delete_duplicate',
      );
    });

    should("replace the element correctly for 'set'", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $elValue$.get(_.tester.vine).next([setNode, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match('foreach__el_set');
    });

    should(
      'handle insertion and deletions of renders with multiple nodes',
      async () => {
        $renderer.get(_.tester.vine).render = (value) => {
          const node = document.createDocumentFragment();
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          return renderNode({node});
        };

        const element = _.tester.bootstrapElement(HOST);
        const id = 'div';

        $elValue$.get(_.tester.vine).next([id]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__el_multi_insert',
        );

        $elValue$.get(_.tester.vine).next([]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__el_multi_delete',
        );
      },
    );
  });

  test('el slotless', () => {
    should("process 'init' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_init',
      );
    });

    should("process 'insert' correctly for index 0", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';

      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elSlotlessValue$
        .get(_.tester.vine)
        .next([insertNode, node1, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_insert_start',
      );
    });

    should("process 'insert' correctly for index 2", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elSlotlessValue$
        .get(_.tester.vine)
        .next([node1, node2, insertNode, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_insert_middle',
      );
    });

    should("process 'insert' correctly for large index", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const insertNode = 'div0';
      $elSlotlessValue$
        .get(_.tester.vine)
        .next([node1, node2, node3, insertNode]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_insert_end',
      );
    });

    should("process 'delete' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      $elSlotlessValue$.get(_.tester.vine).next([node1, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_delete',
      );
    });

    should('ignore node insertions with the same id', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $elSlotlessValue$.get(_.tester.vine).next([node1]);
      $elSlotlessValue$.get(_.tester.vine).next([node2]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_same_id',
      );
    });

    should('handle deleting duplicates', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $elSlotlessValue$.get(_.tester.vine).next([node, node]);

      $elSlotlessValue$.get(_.tester.vine).next([]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_delete_duplicate',
      );
    });

    should("replace the element correctly for 'set'", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $elSlotlessValue$.get(_.tester.vine).next([node1, node2, node3]);

      const setNode = 'div0';
      $elSlotlessValue$.get(_.tester.vine).next([setNode, node2, node3]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__el_slotless_set',
      );
    });

    should(
      'handle insertion and deletions of renders with multiple nodes',
      async () => {
        $renderer.get(_.tester.vine).render = (value) => {
          const node = document.createDocumentFragment();
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          return renderNode({node});
        };

        const element = _.tester.bootstrapElement(HOST);
        const id = 'div';

        $elSlotlessValue$.get(_.tester.vine).next([id]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__el_slotless_multi_insert',
        );

        $elSlotlessValue$.get(_.tester.vine).next([]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__el_slotless_multi_delete',
        );
      },
    );
  });

  test('withId', () => {
    should("process 'init' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);

      $withIdValue$.get(_.tester.vine).next([['div1'], ['div2'], ['div3']]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_init',
      );
    });

    should("process 'insert' correctly for index 0", async () => {
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
      $withIdValue$
        .get(_.tester.vine)
        .next([[insertNode], [node1], [node2], [node3]]);
      const node1After = harness.target.shadowRoot!.querySelector('div1');
      const node2After = harness.target.shadowRoot!.querySelector('div2');
      const node3After = harness.target.shadowRoot!.querySelector('div3');

      // Check that the other nodes were not removed.
      assert(node1After).to.equal(node1Before);
      assert(node2After).to.equal(node2Before);
      assert(node3After).to.equal(node3Before);
      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_insert_start',
      );
    });

    should("process 'insert' correctly for index 2", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const insertNode = 'div0';
      $withIdValue$
        .get(_.tester.vine)
        .next([[node1], [node2], [insertNode], [node3]]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_insert_middle',
      );
    });

    should("process 'insert' correctly for large index", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const insertNode = 'div0';
      $withIdValue$
        .get(_.tester.vine)
        .next([[node1], [node2], [node3], [insertNode]]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_insert_end',
      );
    });

    should("process 'delete' correctly", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      $withIdValue$.get(_.tester.vine).next([[node1], [node3]]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_delete',
      );
    });

    should('ignore node insertions with the same id', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div1';

      $withIdValue$.get(_.tester.vine).next([[node1]]);
      $withIdValue$.get(_.tester.vine).next([[node2]]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_same_id',
      );
    });

    should('handle deleting duplicates', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node = 'div';
      $withIdValue$.get(_.tester.vine).next([[node], [node]]);

      $withIdValue$.get(_.tester.vine).next([]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_delete_duplicate',
      );
    });

    should("replace the element correctly for 'set'", async () => {
      const element = _.tester.bootstrapElement(HOST);
      const node1 = 'div1';
      const node2 = 'div2';
      const node3 = 'div3';
      $withIdValue$.get(_.tester.vine).next([[node1], [node2], [node3]]);

      const setNode = 'div0';
      $withIdValue$.get(_.tester.vine).next([[setNode], [node2], [node3]]);

      await asyncAssert(snapshotElement(element)).to.match(
        'foreach__with_id_set',
      );
    });

    should(
      'handle insertion and deletions of renders with multiple nodes',
      async () => {
        $renderer.get(_.tester.vine).render = (value) => {
          const node = document.createDocumentFragment();
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          node.appendChild(document.createElement(value));
          return renderNode({node});
        };

        const element = _.tester.bootstrapElement(HOST);
        const id = 'div';

        $withIdValue$.get(_.tester.vine).next([[id]]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__with_id_multi_insert',
        );

        $withIdValue$.get(_.tester.vine).next([]);
        await asyncAssert(snapshotElement(element)).to.match(
          'foreach__with_id_multi_delete',
        );
      },
    );
  });
});
