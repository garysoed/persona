import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Renderer } from '../renderer/renderer';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const SLOT_ELEMENTS_ = Symbol('slotElement');
type SlotNode<R> = Node & {[SLOT_ELEMENTS_]?: R};

export class ResolvedSlotLocator<T, R> extends ResolvedRenderableLocator<T> {
  constructor(
      private readonly parentElementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
      private readonly slotName_: string,
      private readonly renderer_: Renderer<T, R>,
      type: Type<T>) {
    super(instanceStreamId(`${parentElementLocator_}.slot(${slotName_})`, type));
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((parentEl, value) => {
      if (!parentEl) {
        return;
      }

      const childNodes = ImmutableList.of(parentEl.childNodes);
      const slotNode = findCommentNode<R>(childNodes, this.slotName_);

      if (!slotNode) {
        return;
      }

      const oldRender = slotNode[SLOT_ELEMENTS_] || null;
      slotNode[SLOT_ELEMENTS_] = this.renderer_.render(value, oldRender, parentEl, slotNode);
    }, context, this.parentElementLocator_.getReadingId(), this.getWritingId());
  }
}

export class UnresolvedSlotLocator<T, N>
    extends UnresolvedRenderableLocator<T|null> {
  constructor(
      private readonly parentElementLocator_: UnresolvedWatchableLocator<HTMLElement|null>,
      private readonly slotName_: string,
      private readonly converter_: Renderer<T, N>,
      private readonly type_: Type<T>) {
    super();
  }

  resolve(resolver: LocatorPathResolver): ResolvedSlotLocator<T, N> {
    return new ResolvedSlotLocator(
        this.parentElementLocator_.resolve(resolver),
        this.slotName_,
        this.converter_,
        this.type_);
  }
}

type SlotLocator<T, R> = ResolvedSlotLocator<T, R>|UnresolvedSlotLocator<T, R>;
export function slot<T, R>(
    parentElement: UnresolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    renderer: Renderer<T, R>,
    type: Type<T>): UnresolvedSlotLocator<T, R>;
export function slot<T, R>(
    parentElement: ResolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    renderer: Renderer<T, R>,
    type: Type<T>): ResolvedSlotLocator<T, R>;
export function slot<T, R>(
    parentElement: UnresolvedWatchableLocator<HTMLElement|null>|
        ResolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    renderer: Renderer<T, R>,
    type: Type<T>): SlotLocator<T, R> {
  if (parentElement instanceof UnresolvedWatchableLocator) {
    return new UnresolvedSlotLocator(parentElement, slotName, renderer, type);
  } else {
    return new ResolvedSlotLocator(parentElement, slotName, renderer, type);
  }
}

export function findCommentNode<R>(
    childNodes: ImmutableList<Node>,
    commentContent: string): SlotNode<R>|null {
  return childNodes.find(node => {
    return node.nodeName === '#comment' &&
        !!node.nodeValue &&
        node.nodeValue.trim() === commentContent;
  });
}
