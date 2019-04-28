import { assert, setup, should, test } from '@gs-testing/main';
import { ArrayDiff } from '@gs-tools/rxjs';
import { InstanceofType } from '@gs-types';
import { Subject } from '@rxjs';
import { element } from './element';
import { repeated, RepeatedOutput } from './repeated';


test('persona.output.repeated', () => {
  const ELEMENT_ID = 'elementId';
  const SLOT_NAME = 'slotName';
  const TAG_NAME = 'tag-name';
  let output: RepeatedOutput;
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
    let diffSubject: Subject<ArrayDiff<Map<string, string>>>;

    setup(() => {
      diffSubject = new Subject<ArrayDiff<Map<string, string>>>();

      output.output(shadowRoot, diffSubject).subscribe();
    });

    should(`process 'init' correctly`, () => {
      diffSubject.next({
        type: 'init',
        value: [
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', 'a'], ['b', 'b']]),
          new Map([['a', '3'], ['b', '4']]),
        ],
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
        type: 'init',
        value: [
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '1'], ['b', '2']]),
        ],
      });

      diffSubject.next({index: 0, value: new Map([['a', '0'], ['b', '0']]), type: 'insert'});

      const el = slot.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
    });

    should(`process 'insert' correctly for index 2`, () => {
      diffSubject.next({
        type: 'init',
        value: [
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '1'], ['b', '2']]),
        ],
      });

      diffSubject.next({index: 2, value: new Map([['a', '0'], ['b', '0']]), type: 'insert'});

      // tslint:disable-next-line: no-non-null-assertion
      const el = slot.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
    });

    should(`process 'insert' correctly for large index`, () => {
      diffSubject.next({
        type: 'init',
        value: [
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '1'], ['b', '2']]),
        ],
      });

      diffSubject.next({index: 4, value: new Map([['a', '0'], ['b', '0']]), type: 'insert'});

      // tslint:disable-next-line: no-non-null-assertion
      const el = slot.nextSibling!.nextSibling!.nextSibling!.nextSibling as HTMLElement;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('0');
      assert(el.getAttribute('b')).to.equal('0');
    });

    should(`process 'delete' correctly`, () => {
      diffSubject.next({
        type: 'init',
        value: [
          new Map([['a', '1'], ['b', '2']]),
          new Map([['a', '3'], ['b', '4']]),
          new Map([['a', '5'], ['b', '6']]),
        ],
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
        type: 'set',
        value: new Map([['a', 'a'], ['b', 'b']]),
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
        type: 'set',
        value: new Map([['a', 'a'], ['b', 'b']]),
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
        type: 'set',
        value: new Map([['a', 'a'], ['b', 'b']]),
      });

      assert(slot.nextSibling).to.equal(existingElement);
      assert(existingElement.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(existingElement.getAttribute('a')).to.equal('a');
      assert(existingElement.getAttribute('b')).to.equal('b');

      assert(existingElement.nextSibling).to.beNull();
    });
  });
});
