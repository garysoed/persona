import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';

import { SimpleElementRenderSpec } from '../render/simple-element-render-spec';

import { element } from './element';
import { single } from './single';


test('@persona/main/single', init => {
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
    return {shadowRoot, slot, parentEl, output};
  });

  test('output', _, init => {
    const _ = init(_ => {
      const render$ = new Subject<SimpleElementRenderSpec|null>();

      run(render$.pipe(_.output.output(_.shadowRoot)));

      return {..._, render$};
    });

    should(`process correctly for adding a node`, () => {
      _.render$.next(new SimpleElementRenderSpec(
        'tag-name',
        new Map([['a', '1'], ['b', '2']]),
        'content',
      ));

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal('tag-name');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('2');
      assert(el.innerText).to.equal('content');
    });

    should(`process correctly for replacing a node`, () => {
      _.render$.next(new SimpleElementRenderSpec(
        'tag-name',
        new Map([['a', '1'], ['b', '2']]),
        'content1',
      ));
      _.render$.next(new SimpleElementRenderSpec(
        'tag-name-2',
        new Map([['c', '3'], ['d', '4']]),
        'content2',
      ));

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal('tag-name-2');
      assert(el.getAttribute('c')).to.equal('3');
      assert(el.getAttribute('d')).to.equal('4');
      assert(el.innerText).to.equal('content2');

      assert(el.nextSibling).to.beNull();
    });

    should(`process correctly for deleting a node`, () => {
      _.render$.next(new SimpleElementRenderSpec(
        'tag-name',
        new Map([['a', '1'], ['b', '2']]),
        'content',
      ));
      _.render$.next(null);

      assert(_.slot.nextSibling).to.beNull();
    });

    should(`not delete the node if can be reused`, () => {
      _.render$.next(new SimpleElementRenderSpec(
        'tag-name',
        new Map([['a', '1'], ['b', '2']]),
        'content1',
      ));
      const el = _.slot.nextSibling as HTMLElement;

      _.render$.next(new SimpleElementRenderSpec(
        'tag-name',
        new Map([['c', '3'], ['d', '4']]),
        'content2',
      ));

      const el2 = _.slot.nextSibling as HTMLElement;
      assert(el2).to.equal(el);
      assert(el2.tagName.toLowerCase()).to.equal('tag-name');
      assert(el2.getAttribute('c')).to.equal('3');
      assert(el2.getAttribute('d')).to.equal('4');
      assert(el2.innerText).to.equal('content2');
    });
  });
});
