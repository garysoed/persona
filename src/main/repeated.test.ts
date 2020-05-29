import { assert, run, should, test } from 'gs-testing';
import { ArrayDiff } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { BehaviorSubject, of as observableOf, Subject } from 'rxjs';

import { NoopRenderSpec } from '../render/noop-render-spec';
import { RenderSpec } from '../render/render-spec';
import { SimpleElementRenderSpec } from '../render/simple-element-render-spec';
import { createFakeContext } from '../testing/create-fake-context';

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

    return {output, context: createFakeContext({shadowRoot}), parentEl, slot};
  });

  test('output', _, init => {
    const _ = init(_ => {
      const diffSubject = new Subject<ArrayDiff<RenderSpec>>();

      run(diffSubject.pipe(_.output.output(_.context)));

      return {..._, diffSubject};
    });

    should(`process 'init' correctly`, () => {
      const attrs1$ = new BehaviorSubject(new Map([['a', '1'], ['b', '2']]));
      const text1$ = new BehaviorSubject('content1');
      const attrs2$ = new BehaviorSubject(new Map([['a', 'a'], ['b', 'b']]));
      const text2$ = new BehaviorSubject('content2');
      const attrs3$ = new BehaviorSubject(new Map([['a', '3'], ['b', '4']]));
      const text3$ = new BehaviorSubject('content3');

      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, attrs1$, text1$),
          new SimpleElementRenderSpec(TAG_NAME, attrs2$, text2$),
          new SimpleElementRenderSpec(TAG_NAME, attrs3$, text3$),
        ],
      });

      const el1 = _.slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('1');
      assert(el1.getAttribute('b')).to.equal('2');
      assert(el1.textContent).to.equal('content1');

      const el2 = el1.nextSibling as HTMLElement;
      assert(el2.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el2.getAttribute('a')).to.equal('a');
      assert(el2.getAttribute('b')).to.equal('b');
      assert(el2.textContent).to.equal('content2');

      const el3 = el2.nextSibling as HTMLElement;
      assert(el3.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el3.getAttribute('a')).to.equal('3');
      assert(el3.getAttribute('b')).to.equal('4');
      assert(el3.textContent).to.equal('content3');

      // Change all the attributes and inner texts.
      attrs1$.next(new Map([['a', '2'], ['b', '3']]));
      text1$.next('content1a');
      assert(el1.getAttribute('a')).to.equal('2');
      assert(el1.getAttribute('b')).to.equal('3');
      assert(el1.textContent).to.equal('content1a');

      attrs2$.next(new Map([['a', 'b'], ['b', 'c']]));
      text2$.next('content2a');
      assert(el2.getAttribute('a')).to.equal('b');
      assert(el2.getAttribute('b')).to.equal('c');
      assert(el2.textContent).to.equal('content2a');

      attrs3$.next(new Map([['a', '4'], ['b', '5']]));
      text3$.next('content3a');
      assert(el3.getAttribute('a')).to.equal('4');
      assert(el3.getAttribute('b')).to.equal('5');
      assert(el3.textContent).to.equal('content3a');
    });

    should(`process 'insert' correctly for index 0`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
        ],
      });

      const insertAttrs$ = new BehaviorSubject(new Map([['a', '0'], ['b', '0']]));
      const insertText$ = new BehaviorSubject('content');
      _.diffSubject.next({
        index: 0,
        type: 'insert',
        value: new SimpleElementRenderSpec(TAG_NAME, insertAttrs$, insertText$),
      });

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
      assert(el.textContent).to.equal('content');

      // Change the attribute and text.
      insertAttrs$.next(new Map([['a', '1'], ['b', '1']]));
      insertText$.next('contenta');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('1');
      assert(el.textContent).to.equal('contenta');
    });

    should(`process 'insert' correctly for index 2`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
        ],
      });

      const insertAttrs$ = new BehaviorSubject(new Map([['a', '0'], ['b', '0']]));
      const insertText$ = new BehaviorSubject('content');
      _.diffSubject.next({
        index: 2,
        type: 'insert',
        value: new SimpleElementRenderSpec(TAG_NAME, insertAttrs$, insertText$),
      });

      const el = _.slot.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
      assert(el.textContent).to.equal('content');

      // Change the attribute and text.
      insertAttrs$.next(new Map([['a', '1'], ['b', '1']]));
      insertText$.next('contenta');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('1');
      assert(el.textContent).to.equal('contenta');
    });

    should(`process 'insert' correctly for large index`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
        ],
      });

      const insertAttrs$ = new BehaviorSubject(new Map([['a', '0'], ['b', '0']]));
      const insertText$ = new BehaviorSubject('content');
      _.diffSubject.next({
        index: 4,
        type: 'insert',
        value: new SimpleElementRenderSpec(TAG_NAME, insertAttrs$, insertText$),
      });

      const el = _.slot.nextSibling!.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
      assert(el.textContent).to.equal('content');

      // Change the attribute and text.
      insertAttrs$.next(new Map([['a', '1'], ['b', '1']]));
      insertText$.next('contenta');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('1');
      assert(el.textContent).to.equal('contenta');
    });

    should(`process 'delete' correctly`, () => {
      _.diffSubject.next({
        type: 'init',
        value: [
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '1'], ['b', '2']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '3'], ['b', '4']]))),
          new SimpleElementRenderSpec(TAG_NAME, observableOf(new Map([['a', '5'], ['b', '6']]))),
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

      const setAttrs$ = new BehaviorSubject(new Map([['a', 'a'], ['b', 'b']]));
      const setText$ = new BehaviorSubject('content');
      _.diffSubject.next({
        index: 0,
        type: 'set',
        value: new SimpleElementRenderSpec(TAG_NAME, setAttrs$, setText$),
      });

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.getAttribute('b')).to.equal('b');
      assert(el.textContent).to.equal('content');

      assert(el.nextSibling).to.beNull();

      // Change the attribute and text.
      setAttrs$.next(new Map([['a', '1'], ['b', '1']]));
      setText$.next('contenta');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('1');
      assert(el.textContent).to.equal('contenta');
    });

    should(`replace the element correctly for 'set' if existing element is not HTMLElement`, () => {
      const existingElement = document.createTextNode('text');
      _.parentEl.appendChild(existingElement);

      const setAttrs$ = new BehaviorSubject(new Map([['a', 'a'], ['b', 'b']]));
      const setText$ = new BehaviorSubject('content');
      _.diffSubject.next({
        index: 0,
        type: 'set',
        value: new SimpleElementRenderSpec(TAG_NAME, setAttrs$, setText$),
      });

      const el = _.slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.getAttribute('b')).to.equal('b');
      assert(el.textContent).to.equal('content');

      assert(el.nextSibling).to.beNull();

      // Change the attribute and text.
      setAttrs$.next(new Map([['a', '1'], ['b', '1']]));
      setText$.next('contenta');
      assert(el.getAttribute('a')).to.equal('1');
      assert(el.getAttribute('b')).to.equal('1');
      assert(el.textContent).to.equal('contenta');
    });

    should(`reuse existing element for 'set'`, () => {
      const existingElement = document.createElement(TAG_NAME);
      _.parentEl.appendChild(existingElement);

      const setAttrs$ = new BehaviorSubject(new Map([['a', 'a'], ['b', 'b']]));
      const setText$ = new BehaviorSubject('content');
      _.diffSubject.next({
        index: 0,
        type: 'set',
        value: new SimpleElementRenderSpec(TAG_NAME, setAttrs$, setText$),
      });

      assert(_.slot.nextSibling).to.equal(existingElement);
      assert(existingElement.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(existingElement.getAttribute('a')).to.equal('a');
      assert(existingElement.getAttribute('b')).to.equal('b');
      assert(existingElement.textContent).to.equal('content');

      assert(existingElement.nextSibling).to.beNull();

      // Change the attribute and text.
      setAttrs$.next(new Map([['a', '1'], ['b', '1']]));
      setText$.next('contenta');
      assert(existingElement.getAttribute('a')).to.equal('1');
      assert(existingElement.getAttribute('b')).to.equal('1');
      assert(existingElement.textContent).to.equal('contenta');
    });
  });
});
