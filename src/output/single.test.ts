import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { element } from '../main/element';
import { createFakeContext } from '../testing/create-fake-context';

import { single } from './single';


test('@persona/output/single', init => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      single: single(SLOT_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const slot = document.createComment(SLOT_NAME);

    const parentEl = document.createElement('div');
    parentEl.id = ELEMENT_ID;
    parentEl.appendChild(slot);

    shadowRoot.appendChild(parentEl);

    const output = $._.single;
    return {context: createFakeContext({shadowRoot}), slot, parentEl, output};
  });

  test('output', _, init => {
    const _ = init(_ => {
      const render$ = new Subject<Node|null>();

      run(render$.pipe(_.output.output(_.context)));

      return {..._, render$};
    });

    should(`process correctly for adding a node`, () => {
      const node = document.createElement('div');
      _.render$.next(node);

      assert(_.slot.nextSibling).to.equal(node);
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should(`process correctly for replacing a node`, () => {
      const node1 = document.createElement('div');
      _.render$.next(node1);

      const node2 = document.createElement('div');
      _.render$.next(node2);

      assert(_.slot.nextSibling).to.equal(node2);
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should(`process correctly for deleting a node`, () => {
      _.render$.next(document.createElement('div'));
      _.render$.next(null);

      assert(_.slot.nextSibling).to.beNull();
    });
  });
});
