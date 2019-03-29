import { assert, setup, should, test } from '@gs-testing/main';
import { InstanceofType } from 'gs-types/export';
import { Subject } from 'rxjs';
import { element } from '../input/element';
import { ArrayDiff, repeated, RepeatedOutput } from './repeated';

type Payload = {a: string; b: string};

test('persona.output.repeated', () => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';
  const TAG_NAME = 'tag-name';
  let output: RepeatedOutput<Payload>;
  let shadowRoot: ShadowRoot;
  let parentEl: HTMLElement;
  let slot: Node;

  setup(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      list: repeated(SLOT_NAME, TAG_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    slot = document.createComment(SLOT_NAME);

    parentEl = document.createElement('div');
    parentEl.id = ELEMENT_ID;
    parentEl.appendChild(slot);

    shadowRoot.appendChild(parentEl);

    output = $._.list;
  });

  test('output', () => {
    let diffSubject: Subject<ArrayDiff<Payload>>;

    setup(() => {
      diffSubject = new Subject<ArrayDiff<Payload>>();

      output.output(shadowRoot, diffSubject).subscribe();
    });

    should(`process 'init' correctly`, () => {
      diffSubject.next({
        payload: [
          {a: '1', b: '2'},
          {a: 'a', b: 'b'},
          {a: '3', b: '4'},
        ],
        type: 'init',
      });

      const el1 = slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('1');
      assert(el1.getAttribute('b')).to.equal('2');

      const el2 = el1.nextSibling as HTMLElement;
      assert(el2.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el2.getAttribute('a')).to.equal('a');
      assert(el2.getAttribute('b')).to.equal('b');

      const el3 = el2.nextSibling as HTMLElement;
      assert(el3.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el3.getAttribute('a')).to.equal('3');
      assert(el3.getAttribute('b')).to.equal('4');
    });

    should(`process 'insert' correctly for index 0`, () => {
      diffSubject.next({
        payload: [
          {a: '1', b: '2'},
          {a: '1', b: '2'},
          {a: '1', b: '2'},
        ],
        type: 'init',
      });

      diffSubject.next({index: 0, payload: {a: '0', b: '0'}, type: 'insert'});

      const el = slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
    });

    should(`process 'insert' correctly for index 2`, () => {
      diffSubject.next({
        payload: [
          {a: '1', b: '2'},
          {a: '1', b: '2'},
          {a: '1', b: '2'},
        ],
        type: 'init',
      });

      diffSubject.next({index: 2, payload: {a: '0', b: '0'}, type: 'insert'});

      // tslint:disable-next-line: no-non-null-assertion
      const el = slot.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
    });

    should(`process 'insert' correctly for large index`, () => {
      diffSubject.next({
        payload: [
          {a: '1', b: '2'},
          {a: '1', b: '2'},
          {a: '1', b: '2'},
        ],
        type: 'init',
      });

      diffSubject.next({index: 4, payload: {a: '0', b: '0'}, type: 'insert'});

      // tslint:disable-next-line: no-non-null-assertion
      const el = slot.nextSibling!.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
    });

    should(`process 'delete' correctly`, () => {
      diffSubject.next({
        payload: [
          {a: '1', b: '2'},
          {a: '3', b: '4'},
          {a: '5', b: '6'},
        ],
        type: 'init',
      });

      diffSubject.next({index: 1, type: 'delete'});

      const el1 = slot.nextSibling as HTMLElement;
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
      parentEl.appendChild(existingElement);

      diffSubject.next({
        index: 0,
        payload: {a: 'a', b: 'b'},
        type: 'set',
      });

      const el1 = slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('a');
      assert(el1.getAttribute('b')).to.equal('b');

      assert(el1.nextSibling).to.beNull();
    });

    should(`replace the element correctly for 'set' if existing element is not HTMLElement`, () => {
      const existingElement = document.createTextNode('text');
      parentEl.appendChild(existingElement);

      diffSubject.next({
        index: 0,
        payload: {a: 'a', b: 'b'},
        type: 'set',
      });

      const el1 = slot.nextSibling as HTMLElement;
      assert(el1.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el1.getAttribute('a')).to.equal('a');
      assert(el1.getAttribute('b')).to.equal('b');

      assert(el1.nextSibling).to.beNull();
    });

    should(`reuse existing element for 'set'`, () => {
      const existingElement = document.createElement(TAG_NAME);
      parentEl.appendChild(existingElement);

      diffSubject.next({
        index: 0,
        payload: {a: 'a', b: 'b'},
        type: 'set',
      });

      assert(slot.nextSibling).to.equal(existingElement);
      assert(existingElement.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(existingElement.getAttribute('a')).to.equal('a');
      assert(existingElement.getAttribute('b')).to.equal('b');

      assert(existingElement.nextSibling).to.beNull();
    });
  });
});