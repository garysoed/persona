import { VineBuilder } from 'grapevine/export/main';
import { assert, retryUntil, should } from 'gs-testing/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { HasPropertiesType, InstanceofType, StringType } from 'gs-types/export';
import { __id, Renderer } from '../renderer/renderer';
import { element, ResolvedElementLocator } from './element-locator';
import { findCommentNode, ResolvedSlotLocator, slot, SLOT_ELEMENT_ } from './slot-locator';

const RENDERER: Renderer<{[__id]: string}, HTMLElement> = {
  render(value: {[__id]: string}): HTMLElement|null {
    const id = value[__id];
    if (!id) {
      return null;
    }

    return document.createElement(id);
  },
};

describe('locator.SlotLocator', () => {
  const SLOT_NAME = 'slotName';
  let elementLocator: ResolvedElementLocator<HTMLDivElement>;
  let locator: ResolvedSlotLocator<{[__id]: string}>;
  let vineBuilder: VineBuilder;

  beforeEach(() => {
    vineBuilder = new VineBuilder();
    elementLocator = element('div', InstanceofType(HTMLDivElement));
    locator = slot(
        elementLocator,
        SLOT_NAME,
        RENDERER,
        HasPropertiesType({[__id]: StringType}));
  });

  describe('startRender', () => {
    should(`render correctly`, async () => {
      const context = new BaseDisposable();

      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      innerRoot.appendChild(commentNode);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__id]: 'input'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => (innerRoot.childNodes.item(1) as HTMLElement).tagName)
          .to.equal('INPUT');
    });

    should(`delete if the new node is null`, async () => {
      const context = new BaseDisposable();

      const oldElement = document.createElement('input');
      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      (commentNode as any)[SLOT_ELEMENT_] = oldElement;
      innerRoot.appendChild(commentNode);
      innerRoot.appendChild(oldElement);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__id]: ''}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => innerRoot.childNodes.length).to.equal(1);
    });

    should(`replace the old node`, async () => {
      const context = new BaseDisposable();

      const oldElement = document.createElement('input');
      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      (commentNode as any)[SLOT_ELEMENT_] = oldElement;
      innerRoot.appendChild(commentNode);
      innerRoot.appendChild(oldElement);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__id]: 'audio'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => (innerRoot.childNodes.item(1) as HTMLElement).tagName)
          .to.equal('AUDIO');
      await retryUntil(() => innerRoot.childNodes.length).to.equal(2);
    });

    should(`do nothing if the slot does not exist`, async () => {
      const context = new BaseDisposable();

      const innerRoot = document.createElement('div');
      const commentNode = document.createComment('otherSlot');
      innerRoot.appendChild(commentNode);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__id]: 'audio'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => innerRoot.childNodes.length).to.equal(1);
    });

    should(`do nothing if the parent element does not exist`, () => {
      const context = new BaseDisposable();

      vineBuilder.source(elementLocator.getReadingId(), null);
      vineBuilder.stream(locator.getWritingId(), () => ({[__id]: 'audio'}));

      const vine = vineBuilder.run();
      assert(() => {
        locator.startRender(vine, context);
      }).toNot.throw();
    });
  });

  describe('findCommentNode', () => {
    should(`return the correct comment node`, () => {
      const commentNode = document.createComment(SLOT_NAME);

      assert(findCommentNode(ImmutableList.of([commentNode]), SLOT_NAME)).to.equal(commentNode);
    });

    should(`return null if the content does not exist`, () => {
      const commentNode = document.createComment('otherName');

      assert(findCommentNode(ImmutableList.of([commentNode]), SLOT_NAME)).to.beNull();
    });

    should(`return null if the node type is incorrect`, () => {
      const node = document.createElement('div');

      assert(findCommentNode(ImmutableList.of([node]), SLOT_NAME)).to.beNull();
    });
  });
});
