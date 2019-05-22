import { assert, setup, should, test } from '@gs-testing';
import { InstanceofType } from '@gs-types';
import { Subject } from '@rxjs';
import { element } from './element';
import { RenderData, single, SingleOutput } from './single';

test('@persona/main/single', () => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';
  let output: SingleOutput;
  let shadowRoot: ShadowRoot;
  let parentEl: HTMLElement;
  let slot: Node;

  setup(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      single: single(SLOT_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    slot = document.createComment(SLOT_NAME);

    parentEl = document.createElement('div');
    parentEl.id = ELEMENT_ID;
    parentEl.appendChild(slot);

    shadowRoot.appendChild(parentEl);

    output = $._.single;
  });

  test('output', () => {
    let renderSubject: Subject<RenderData|null>;

    setup(() => {
      renderSubject = new Subject<RenderData|null>();

      output.output(shadowRoot, renderSubject).subscribe();
    });

    should(`process correctly for adding a node`, () => {
      renderSubject.next({
        attr: new Map([['a', '1'], ['b', '2']]),
        innerText: 'content',
        tag: 'tag-name',
      });

      const el = slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal('tag-name');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('2');
      assert(el.innerText).to.equal('content');
    });

    should(`process correctly for replacing a node`, () => {
      renderSubject.next({
        attr: new Map([['a', '1'], ['b', '2']]),
        innerText: 'content1',
        tag: 'tag-name',
      });
      renderSubject.next({
        attr: new Map([['c', '3'], ['d', '4']]),
        innerText: 'content2',
        tag: 'tag-name-2',
      });

      const el = slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal('tag-name-2');
      assert(el.getAttribute('c')).to.equal('3');
      assert(el.getAttribute('d')).to.equal('4');
      assert(el.innerText).to.equal('content2');

      assert(el.nextSibling).to.beNull();
    });

    should(`process correctly for deleting a node`, () => {
      renderSubject.next({tag: 'tag-name', attr: new Map([['a', '1'], ['b', '2']])});
      renderSubject.next(null);

      assert(slot.nextSibling).to.beNull();
    });

    should(`not delete the node if the tag name does not change`, () => {
      renderSubject.next({
        attr: new Map([['a', '1'], ['b', '2']]),
        innerText: 'content1',
        tag: 'tag-name',
      });
      const el = slot.nextSibling as HTMLElement;

      renderSubject.next({
        attr: new Map([['c', '3'], ['d', '4']]),
        innerText: 'content2',
        tag: 'tag-name',
      });

      const el2 = slot.nextSibling as HTMLElement;
      assert(el2).to.equal(el);
      assert(el2.tagName.toLowerCase()).to.equal('tag-name');
      assert(el2.getAttribute('c')).to.equal('3');
      assert(el2.getAttribute('d')).to.equal('4');
      assert(el2.innerText).to.equal('content2');
    });
  });
});
