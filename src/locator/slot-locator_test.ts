import { VineBuilder } from 'grapevine/export/main';
import { assert, retryUntil, should } from 'gs-testing/export/main';
import { createSpyObject, fake, SpyObj } from 'gs-testing/export/spy';
import { ImmutableList } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { HasPropertiesType, InstanceofType, StringType } from 'gs-types/export';
import { __renderId } from '../renderer/render-id';
import { Renderer } from '../renderer/renderer';
import { element, ResolvedElementLocator } from './element-locator';
import { findCommentNode, ResolvedSlotLocator, slot, SLOT_ELEMENT_ } from './slot-locator';

interface Data {
  [__renderId]: string;
}

describe('locator.SlotLocator', () => {
  const SLOT_NAME = 'slotName';
  let elementLocator: ResolvedElementLocator<HTMLDivElement>;
  let locator: ResolvedSlotLocator<{[__renderId]: string}>;
  let mockRenderer: SpyObj<Renderer<{[__renderId]: string}, HTMLElement>>;
  let vineBuilder: VineBuilder;

  beforeEach(() => {
    vineBuilder = new VineBuilder();
    elementLocator = element('div', InstanceofType(HTMLDivElement));
    mockRenderer = createSpyObject<Renderer<Data, HTMLElement>>('Renderer', ['render']);
    locator = slot(
        elementLocator,
        SLOT_NAME,
        mockRenderer,
        HasPropertiesType({[__renderId]: StringType}));
  });

  describe('startRender', () => {
    should(`render correctly`, async () => {
      const context = new BaseDisposable();

      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      innerRoot.appendChild(commentNode);

      const element = document.createElement('input');
      fake(mockRenderer.render).always().return(element);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__renderId]: 'input'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => innerRoot.childNodes.item(1)).to.equal(element);
    });

    should(`replace the old node`, async () => {
      const context = new BaseDisposable();

      const oldElement = document.createElement('input');
      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      (commentNode as any)[SLOT_ELEMENT_] = oldElement;
      innerRoot.appendChild(commentNode);
      innerRoot.appendChild(oldElement);

      const newElement = document.createElement('input');
      fake(mockRenderer.render).always().return(newElement);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__renderId]: 'audio'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => innerRoot.childNodes.item(1)).to.equal(newElement);
      await retryUntil(() => innerRoot.childNodes.length).to.equal(2);
    });

    should(`do nothing if the value does not change`, async () => {
      const context = new BaseDisposable();

      const oldElement = document.createElement('input');
      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      (commentNode as any)[SLOT_ELEMENT_] = oldElement;
      innerRoot.appendChild(commentNode);
      innerRoot.appendChild(oldElement);

      fake(mockRenderer.render).always().return(oldElement);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__renderId]: 'audio'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => innerRoot.childNodes.item(1)).to.equal(oldElement);
      await retryUntil(() => innerRoot.childNodes.length).to.equal(2);
    });

    should(`do nothing if the slot does not exist`, async () => {
      const context = new BaseDisposable();

      const innerRoot = document.createElement('div');
      const commentNode = document.createComment('otherSlot');
      innerRoot.appendChild(commentNode);

      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => ({[__renderId]: 'audio'}));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => innerRoot.childNodes.length).to.equal(1);
    });

    should(`do nothing if the parent element does not exist`, () => {
      const context = new BaseDisposable();

      vineBuilder.source(elementLocator.getReadingId(), null);
      vineBuilder.stream(locator.getWritingId(), () => ({[__renderId]: 'audio'}));

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
