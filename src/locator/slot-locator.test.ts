import { VineBuilder } from 'grapevine/export/main';
import { assert, match, retryUntil, should, test } from 'gs-testing/export/main';
import { createSpyObject, fake, SpyObj } from 'gs-testing/export/spy';
import { ImmutableList } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { HasPropertiesType, InstanceofType, StringType } from 'gs-types/export';
import { of as observableOf } from 'rxjs';
import { __renderId } from '../renderer/render-id';
import { Renderer } from '../renderer/renderer';
import { element, ResolvedElementLocator } from './element-locator';
import { findCommentNode, ResolvedSlotLocator, slot, SLOT_ELEMENTS_ } from './slot-locator';

interface Data {
  [__renderId]: string;
}

test('locator.SlotLocator', () => {
  const SLOT_NAME = 'slotName';
  let elementLocator: ResolvedElementLocator<HTMLDivElement>;
  let locator: ResolvedSlotLocator<{[__renderId]: string}, HTMLElement>;
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

  test('startRender', () => {
    should(`render correctly`, async () => {
      const context = new BaseDisposable();

      const innerRoot = document.createElement('div');
      const commentNode = document.createComment(SLOT_NAME);
      innerRoot.appendChild(commentNode);

      const element = document.createElement('input');
      fake(mockRenderer.render).always().return(element);

      const data = {[__renderId]: 'input'};
      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => observableOf(data));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => mockRenderer.render).to
          .equal(match.anySpyThat().haveBeenCalledWith(data, null, innerRoot, commentNode));
    });

    should(`do nothing if the slot does not exist`, async () => {
      const context = new BaseDisposable();

      const innerRoot = document.createElement('div');
      const commentNode = document.createComment('otherSlot');
      innerRoot.appendChild(commentNode);

      const data = {[__renderId]: 'audio'};
      vineBuilder.source(elementLocator.getReadingId(), innerRoot);
      vineBuilder.stream(locator.getWritingId(), () => observableOf(data));

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      await retryUntil(() => mockRenderer.render).toNot
          .equal(match.anySpyThat().haveBeenCalled());
    });

    should(`do nothing if the parent element does not exist`, async () => {
      const data = {[__renderId]: 'audio'};
      vineBuilder.source(elementLocator.getReadingId(), null);
      vineBuilder.stream(locator.getWritingId(), () => observableOf(data));

      await retryUntil(() => mockRenderer.render).toNot
          .equal(match.anySpyThat().haveBeenCalled());
    });
  });

  test('findCommentNode', () => {
    should(`return the correct comment node`, () => {
      const commentNode = document.createComment(SLOT_NAME);

      assert(findCommentNode(ImmutableList.of([commentNode]), SLOT_NAME)).to.equal(commentNode);
    });

    should(`match comment nodes with white spaces at the end`, () => {
      const commentNode = document.createComment(`  ${SLOT_NAME}   `);

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
