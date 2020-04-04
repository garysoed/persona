import { NoopRenderSpec } from 'export';
import { assert, should, test } from 'gs-testing';
import { ArrayDiff } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';
import { SimpleElementRenderSpec } from 'src/render/simple-element-render-spec';

import { RenderSpec } from '../render/render-spec';

import { element } from './element';
import { repeated } from './repeated';


test('@persona/output/repeated', init => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';
  const TAG_NAME = 'tag-name';

  const _ = init(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      list: repeated(SLOT_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const slot = document.createComment(SLOT_NAME);

    const parentEl = document.createElement('div');
    parentEl.id = ELEMENT_ID;
    parentEl.appendChild(slot);

    shadowRoot.appendChild(parentEl);

    const output = $._.list;

    return {output, shadowRoot, parentEl, slot};
  });

  test('output', _, init => {
    const _ = init(_ => {
      const diffSubject = new Subject<ArrayDiff<RenderSpec>>();

      diffSubject.pipe(_.output.output(_.shadowRoot)).subscribe();

      return {..._, diffSubject};
    });

    should(`process 'init' correctly`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']]), 'content1'),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', 'a'], ['b', 'b']]), 'content2'),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '3'], ['b', '4']]), 'content3'),
        ],
      });

      const el1 = _.slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('1');
      assert(el1.getAttribute('b')).to.equal('2');
      assert(el1.innerText).to.equal('content1');

      const el2 = el1.nextSibling as HTMLElement;
      assert(el2.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el2.getAttribute('a')).to.equal('a');
      assert(el2.getAttribute('b')).to.equal('b');
      assert(el2.innerText).to.equal('content2');

      const el3 = el2.nextSibling as HTMLElement;
      assert(el3.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el3.getAttribute('a')).to.equal('3');
      assert(el3.getAttribute('b')).to.equal('4');
      assert(el3.innerText).to.equal('content3');
    });

    should(`process 'insert' correctly for index 0`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
        ],
      });

      _.diffSubject.next(
          {
            index: 0,
            type: 'insert',
            value: new SimpleElementRenderSpec(
                TAG_NAME,
                new Map([['a', '0'], ['b', '0']]),
                'content',
            ),
          });

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
      assert(el.innerText).to.equal('content');
    });

    should(`process 'insert' correctly for index 2`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
        ],
      });

      _.diffSubject.next({
        index: 2,
        type: 'insert',
        value: new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '0'], ['b', '0']]), 'content'),
      });

      // tslint:disable-next-line: no-non-null-assertion
      const el = _.slot.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
      assert(el.innerText).to.equal('content');
    });

    should(`process 'insert' correctly for large index`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
        ],
      });

      _.diffSubject.next({
        index: 4,
        type: 'insert',
        value: new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '0'], ['b', '0']]), 'content'),
      });

      // tslint:disable-next-line: no-non-null-assertion
      const el = _.slot.nextSibling!.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
      assert(el.innerText).to.equal('content');
    });

    should(`process 'delete' correctly`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '1'], ['b', '2']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '3'], ['b', '4']])),
          new SimpleElementRenderSpec(TAG_NAME, new Map([['a', '5'], ['b', '6']])),
        ],
      });

      _.diffSubject.next({index: 1, type: 'delete', value: new NoopRenderSpec()});

      const el1 = _.slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('1');
      assert(el1.getAttribute('b')).to.equal('2');

      const el2 = el1.nextSibling as HTMLElement;
      assert(el2.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el2.getAttribute('a')).to.equal('5');
      assert(el2.getAttribute('b')).to.equal('6');

      assert(el2.nextSibling).to.beNull();
    });

    should(`replace the element correctly for 'set' if existing element has the wrong tag`, () => {
      const existingElement = document.createElement('div');
      _.parentEl.appendChild(existingElement);

      _.diffSubject.next({
        index: 0,
        type: 'set',
        value: new SimpleElementRenderSpec(TAG_NAME, new Map([['a', 'a'], ['b', 'b']]), 'content'),
      });

      const el1 = _.slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('a');
      assert(el1.getAttribute('b')).to.equal('b');
      assert(el1.innerText).to.equal('content');

      assert(el1.nextSibling).to.beNull();
    });

    should(`replace the element correctly for 'set' if existing element is not HTMLElement`, () => {
      const existingElement = document.createTextNode('text');
      _.parentEl.appendChild(existingElement);

      _.diffSubject.next({
        index: 0,
        type: 'set',
        value: new SimpleElementRenderSpec(TAG_NAME, new Map([['a', 'a'], ['b', 'b']]), 'content'),
      });

      const el1 = _.slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('a');
      assert(el1.getAttribute('b')).to.equal('b');
      assert(el1.innerText).to.equal('content');

      assert(el1.nextSibling).to.beNull();
    });

    should(`reuse existing element for 'set'`, () => {
      const existingElement = document.createElement(TAG_NAME);
      _.parentEl.appendChild(existingElement);

      _.diffSubject.next({
        index: 0,
        type: 'set',
        value: new SimpleElementRenderSpec(TAG_NAME, new Map([['a', 'a'], ['b', 'b']]), 'content'),
      });

      assert(_.slot.nextSibling).to.equal(existingElement);
      assert(existingElement.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(existingElement.getAttribute('a')).to.equal('a');
      assert(existingElement.getAttribute('b')).to.equal('b');
      assert(existingElement.innerText).to.equal('content');

      assert(existingElement.nextSibling).to.beNull();
    });
  });
});
