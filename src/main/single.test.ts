import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { BehaviorSubject, of as observableOf, Subject } from 'rxjs';

import { SimpleElementRenderSpec } from '../render/simple-element-render-spec';
import { createFakeContext } from '../testing/create-fake-context';

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
    return {context: createFakeContext({shadowRoot}), slot, parentEl, output};
  });

  test('output', _, init => {
    const _ = init(_ => {
      const render$ = new Subject<SimpleElementRenderSpec|null>();

      run(render$.pipe(_.output.output(_.context)));

      return {..._, render$};
    });

    should(`process correctly for adding a node`, () => {
      const attrs$ = new BehaviorSubject(new Map([['a', '1'], ['b', '2']]));
      const text$ = new BehaviorSubject('content');
      _.render$.next(new SimpleElementRenderSpec('tag-name', attrs$, text$));

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal('tag-name');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('2');
      assert(el.textContent).to.equal('content');

      // Change the values.
      attrs$.next(new Map([['a', '2'], ['b', '3']]));
      text$.next('newContent');
      assert(el.getAttribute('a')).to.equal('2');
      assert(el.getAttribute('b')).to.equal('3');
      assert(el.textContent).to.equal('newContent');
    });

    should(`process correctly for replacing a node`, () => {
      const oldAttrs$ = new BehaviorSubject(new Map([['a', '1'], ['b', '2']]));
      const oldText$ = new BehaviorSubject('content1');
      _.render$.next(new SimpleElementRenderSpec('tag-name', oldAttrs$, oldText$));

      const newAttrs$ = new BehaviorSubject(new Map([['c', '3'], ['d', '4']]));
      const newText$ = new BehaviorSubject('content2');
      _.render$.next(new SimpleElementRenderSpec('tag-name-2', newAttrs$, newText$));

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal('tag-name-2');
      assert(el.getAttribute('c')).to.equal('3');
      assert(el.getAttribute('d')).to.equal('4');
      assert(el.textContent).to.equal('content2');

      assert(el.nextSibling).to.beNull();

      // Update the old observable values. Nothing should happen.
      oldAttrs$.next(new Map([['a', '2'], ['b', '3']]));
      oldText$.next('newContent');
      assert(el.getAttribute('c')).to.equal('3');
      assert(el.getAttribute('d')).to.equal('4');
      assert(el.textContent).to.equal('content2');

      // Update the new observable values. The update should be reflected.
      newAttrs$.next(new Map([['c', '4'], ['d', '5']]));
      newText$.next('newContent');
      assert(el.getAttribute('c')).to.equal('4');
      assert(el.getAttribute('d')).to.equal('5');
      assert(el.textContent).to.equal('newContent');
    });

    should(`process correctly for deleting a node`, () => {
      _.render$.next(new SimpleElementRenderSpec(
          'tag-name',
          observableOf(new Map([['a', '1'], ['b', '2']])),
          observableOf('content'),
      ));
      _.render$.next(null);

      assert(_.slot.nextSibling).to.beNull();
    });

    should(`not delete the node if can be reused`, () => {
      _.render$.next(new SimpleElementRenderSpec(
          'tag-name',
          observableOf(new Map([['a', '1'], ['b', '2']])),
          observableOf('content1'),
      ));
      const el = _.slot.nextSibling as HTMLElement;

      _.render$.next(new SimpleElementRenderSpec(
          'tag-name',
          observableOf(new Map([['c', '3'], ['d', '4']])),
          observableOf('content2'),
      ));

      const el2 = _.slot.nextSibling as HTMLElement;
      assert(el2).to.equal(el);
      assert(el2.tagName.toLowerCase()).to.equal('tag-name');
      assert(el2.getAttribute('c')).to.equal('3');
      assert(el2.getAttribute('d')).to.equal('4');
      assert(el2.textContent).to.equal('content2');
    });
  });
});
