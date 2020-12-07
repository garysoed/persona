import {assert, run, should, test} from 'gs-testing';
import {instanceofType} from 'gs-types';
import {Subject} from 'rxjs';

import {RenderSpec} from '../render/types/render-spec';
import {RenderSpecType} from '../render/types/render-spec-type';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {multi} from './multi';


function renderElementSpec(tag: string, id?: string): RenderSpec {
  return {type: RenderSpecType.ELEMENT, tag, id: id ?? tag};
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
      const diff$ = new Subject<readonly RenderSpec[]>();

      run(diff$.pipe(_.output.output(_.context)));

      return {..._, diff$};
    });

    should('process \'init\' correctly', () => {
      const node1 = renderElementSpec('div1');
      const node2 = renderElementSpec('div2');
      const node3 = renderElementSpec('div3');

      _.diff$.next([node1, node2, node3]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV1');
      assert((_.slot.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV2');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV3');
    });

    should('process \'insert\' correctly for index 0', () => {
      const node1 = renderElementSpec('div1');
      const node2 = renderElementSpec('div2');
      const node3 = renderElementSpec('div3');

      _.diff$.next([node1, node2, node3]);

      const insertNode = renderElementSpec('div0');
      _.diff$.next([insertNode, node1, node2, node3]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV0');
      assert((_.slot.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV1');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV2');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV3');
    });

    should('process \'insert\' correctly for index 2', () => {
      const node1 = renderElementSpec('div1');
      const node2 = renderElementSpec('div2');
      const node3 = renderElementSpec('div3');
      _.diff$.next([node1, node2, node3]);

      const insertNode = renderElementSpec('div0');
      _.diff$.next([node1, node2, insertNode, node3]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV1');
      assert((_.slot.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV2');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV0');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV3');
    });

    should('process \'insert\' correctly for large index', () => {
      const node1 = renderElementSpec('div1');
      const node2 = renderElementSpec('div2');
      const node3 = renderElementSpec('div3');
      _.diff$.next([node1, node2, node3]);

      const insertNode = renderElementSpec('div0');
      _.diff$.next([node1, node2, node3, insertNode]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV1');
      assert((_.slot.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV2');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV3');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV0');
    });

    should('process \'delete\' correctly', () => {
      const node1 = renderElementSpec('div1');
      const node2 = renderElementSpec('div2');
      const node3 = renderElementSpec('div3');
      _.diff$.next([node1, node2, node3]);

      _.diff$.next([node1, node3]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV1');
      assert((_.slot.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV3');
      assert(_.slot.nextSibling?.nextSibling?.nextSibling).to.beNull();
    });

    should('ignore node insertions with the same id', () => {
      const node1 = renderElementSpec('div1', '1');
      const node2 = renderElementSpec('div1', '1');

      _.diff$.next([node1]);
      _.diff$.next([node2]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV1');
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should('hide errors when deleting', () => {
      const node = renderElementSpec('div');
      _.diff$.next([node, node]);

      _.diff$.next([]);

      assert(_.slot.nextSibling).to.beNull();
    });

    should('replace the element correctly for \'set\'', () => {
      const node1 = renderElementSpec('div1');
      const node2 = renderElementSpec('div2');
      const node3 = renderElementSpec('div3');
      _.diff$.next([node1, node2, node3]);

      const existingElement = document.createElement('div');
      _.parentEl.appendChild(existingElement);

      const setNode = renderElementSpec('div0');
      _.diff$.next([setNode, node2, node3]);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV0');
      assert((_.slot.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV2');
      assert((_.slot.nextSibling?.nextSibling?.nextSibling as HTMLElement).tagName).to.equal('DIV3');
    });
  });
});
