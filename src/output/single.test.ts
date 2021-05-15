import {assert, run, should, test} from 'gs-testing';
import {Subject} from 'rxjs';

import {$div} from '../html/div';
import {RenderElementSpec} from '../render/types/render-element-spec';
import {RenderSpec} from '../render/types/render-spec';
import {RenderSpecType} from '../render/types/render-spec-type';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {single} from './single';


function renderElementSpec(tag: string, id?: string): RenderElementSpec {
  return {type: RenderSpecType.ELEMENT, tag, id: id ?? tag};
}

test('@persona/output/single', init => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, $div, {
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
      const render$ = new Subject<RenderSpec|null>();

      run(render$.pipe(_.output.output(_.context)));

      return {..._, render$};
    });

    should('process correctly for adding a node', () => {
      _.render$.next(renderElementSpec('div'));

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV');
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should('process correctly for replacing a node', () => {
      const node1 = renderElementSpec('div');
      _.render$.next(node1);

      const node2 = renderElementSpec('input');
      _.render$.next(node2);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('INPUT');
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should('not replace node if the new one has the same ID', () => {
      const node1 = renderElementSpec('div');
      _.render$.next(node1);

      const node2 = renderElementSpec('input', 'div');
      _.render$.next(node2);

      assert((_.slot.nextSibling as HTMLElement).tagName).to.equal('DIV');
      assert(_.slot.nextSibling?.nextSibling).to.beNull();
    });

    should('process correctly for deleting a node', () => {
      _.render$.next(renderElementSpec('n'));
      _.render$.next(null);

      assert(_.slot.nextSibling).to.beNull();
    });

    should('hide errors when deleting node', () => {
      const node = renderElementSpec('div');

      _.render$.next(node);

      const newParent = document.createElement('input');
      newParent.appendChild(_.slot.nextSibling!);

      _.render$.next(null);

      assert(_.slot.nextSibling).to.beNull();
    });
  });
});
