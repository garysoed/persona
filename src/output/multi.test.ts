import { Subject } from 'rxjs';
import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { NodeWithId, __id } from '../render/node-with-id';
import { createFakeContext } from '../testing/create-fake-context';
import { element } from '../selector/element';

import { multi } from './multi';


function createNode(id: string): NodeWithId<Node> {
  const node = document.createElement('div');
  return Object.assign(node, {[__id]: id});
}

test('@persona/output/multi', init => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      list: multi(SLOT_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const slot = document.createComment(SLOT_NAME);

    const parentEl = document.createElement('div');
    parentEl.id = ELEMENT_ID;
    parentEl.appendChild(slot);

    shadowRoot.appendChild(parentEl);

    const output = $._.list;

    return {output, context: createFakeContext({shadowRoot}), parentEl, slot};
  });

  test('output', _, init => {
    const _ = init(_ => {
      const diff$ = new Subject<ReadonlyArray<NodeWithId<Node>>>();

      run(diff$.pipe(_.output.output(_.context)));

      return {..._, diff$};
    });

    should('process \'init\' correctly', () => {
      const node1 = createNode('1');
      const node2 = createNode('2');
      const node3 = createNode('3');

      _.diff$.next([node1, node2, node3]);

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });

    should('process \'insert\' correctly for index 0', () => {
      const node1 = createNode('1');
      const node2 = createNode('2');
      const node3 = createNode('3');

      _.diff$.next([node1, node2, node3]);

      const insertNode = createNode('insert');
      _.diff$.next([insertNode, node1, node2, node3]);

      assert(_.slot.nextSibling).to.equal(insertNode);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });

    should('process \'insert\' correctly for index 2', () => {
      const node1 = createNode('1');
      const node2 = createNode('2');
      const node3 = createNode('3');
      _.diff$.next([node1, node2, node3]);

      const insertNode = createNode('insert');
      _.diff$.next([node1, node2, insertNode, node3]);

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(insertNode);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });

    should('process \'insert\' correctly for large index', () => {
      const node1 = createNode('1');
      const node2 = createNode('2');
      const node3 = createNode('3');
      _.diff$.next([node1, node2, node3]);

      const insertNode = createNode('insert');
      _.diff$.next([node1, node2, node3, insertNode]);

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling).to.equal(insertNode);
    });

    should('process \'delete\' correctly', () => {
      const node1 = createNode('1');
      const node2 = createNode('2');
      const node3 = createNode('3');
      _.diff$.next([node1, node2, node3]);

      _.diff$.next([node1, node3]);

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node3);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.beNull();
    });

    should('ignore node insertions with the same id', () => {
      const node1 = createNode('1');
      const node2 = createNode('1');

      _.diff$.next([node1]);
      _.diff$.next([node2]);

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should('hide errors when deleting', () => {
      const node = createNode('n');
      _.diff$.next([node, node]);

      _.diff$.next([]);

      assert(_.slot.nextSibling).to.beNull();
    });

    should('replace the element correctly for \'set\'', () => {
      const node1 = createNode('1');
      const node2 = createNode('2');
      const node3 = createNode('3');
      _.diff$.next([node1, node2, node3]);

      const existingElement = createNode('existing');
      _.parentEl.appendChild(existingElement);

      const setNode = createNode('set');
      _.diff$.next([setNode, node2, node3]);

      assert(_.slot.nextSibling).to.equal(setNode);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });
  });
});
