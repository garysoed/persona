import { assert, run, should, test } from 'gs-testing';
import { ArrayDiff } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';
import { createFakeContext } from '../testing/create-fake-context';

import { multi } from './multi';


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
      const diff$ = new Subject<ArrayDiff<Node>>();

      run(diff$.pipe(_.output.output(_.context)));

      return {..._, diff$};
    });

    should(`process 'init' correctly`, () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');

      _.diff$.next({
        type: 'init',
        value: [node1, node2, node3],
      });

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });

    should(`process 'insert' correctly for index 0`, () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');

      _.diff$.next({
        type: 'init',
        value: [node1, node2, node3],
      });

      const insertNode = document.createElement('div');
      _.diff$.next({
        index: 0,
        type: 'insert',
        value: insertNode,
      });

      assert(_.slot.nextSibling).to.equal(insertNode);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });

    should(`process 'insert' correctly for index 2`, () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      _.diff$.next({
        type: 'init',
        value: [node1, node2, node3],
      });

      const insertNode = document.createElement('div');
      _.diff$.next({
        index: 2,
        type: 'insert',
        value: insertNode,
      });

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(insertNode);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });

    should(`process 'insert' correctly for large index`, () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      _.diff$.next({
        type: 'init',
        value: [node1, node2, node3],
      });

      const insertNode = document.createElement('div');
      _.diff$.next({
        index: 4,
        type: 'insert',
        value: insertNode,
      });

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling).to.equal(insertNode);
    });

    should(`process 'delete' correctly`, () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      _.diff$.next({
        type: 'init',
        value: [node1, node2, node3],
      });

      _.diff$.next({index: 1, type: 'delete', value: node2});

      assert(_.slot.nextSibling).to.equal(node1);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node3);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.beNull();
    });

    should(`replace the element correctly for 'set'`, () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      _.diff$.next({
        type: 'init',
        value: [node1, node2, node3],
      });

      const existingElement = document.createElement('div');
      _.parentEl.appendChild(existingElement);

      const setNode = document.createElement('div');
      _.diff$.next({
        index: 0,
        type: 'set',
        value: setNode,
      });

      assert(_.slot.nextSibling).to.equal(setNode);
      assert(_.slot.nextSibling?.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.equal(node3);
    });
  });
});
