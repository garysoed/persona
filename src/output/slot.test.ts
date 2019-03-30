import { assert, should, test } from '@gs-testing/main';
import { createSpyObject, fake, SpyObj } from '@gs-testing/spy';
import { InstanceofType } from '@gs-types';
import { Subject } from 'rxjs';
import { element } from '../input/element';
import { Renderer } from '../renderer/renderer';
import { slot, SlotOutput } from './slot';

test('output.slot', () => {
  const SLOT_NAME = 'slotName';
  const ELEMENT_ID = 'test';
  let output: SlotOutput<number, HTMLElement>;
  let shadowRoot: ShadowRoot;
  let mockRenderer: SpyObj<Renderer<number, HTMLElement>>;
  let el: HTMLDivElement;

  beforeEach(() => {
    mockRenderer = createSpyObject<Renderer<number, HTMLElement>>('Renderer', ['render']);
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      slot: slot(SLOT_NAME, mockRenderer),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});
    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.slot;
  });

  test('output', () => {
    should(`render correctly`, () => {
      const commentNode = document.createComment(SLOT_NAME);
      el.appendChild(commentNode);

      const subject = new Subject<number>();
      output.output(shadowRoot, subject).subscribe();

      const renderedElement = document.createElement('div');
      fake(mockRenderer.render).always().return(renderedElement);

      const value = 123;
      subject.next(value);

      assert(mockRenderer.render).to.haveBeenCalledWith(value, null, el, commentNode);
    });

    should(`render correctly if the slot name has white spaces`, () => {
      const commentNode = document.createComment(`  ${SLOT_NAME}  `);
      el.appendChild(commentNode);

      const subject = new Subject<number>();
      output.output(shadowRoot, subject).subscribe();

      const renderedElement = document.createElement('div');
      fake(mockRenderer.render).always().return(renderedElement);

      const value = 123;
      subject.next(value);

      assert(mockRenderer.render).to.haveBeenCalledWith(value, null, el, commentNode);
    });

    should(`render correctly if the slot does not exist`, async () => {
      const subject = new Subject<number>();
      output.output(shadowRoot, subject).subscribe();

      const renderedElement = document.createElement('div');
      fake(mockRenderer.render).always().return(renderedElement);

      const value = 123;
      subject.next(value);

      assert(mockRenderer.render).to.haveBeenCalledWith(value, null, el, null);
    });
  });
});
