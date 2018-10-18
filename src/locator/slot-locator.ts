import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Type } from 'gs-types/export';
import { Renderer } from '../renderer/renderer';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const SLOT_ELEMENT_ = Symbol('slotElement');
type SlotNode = Node & {[SLOT_ELEMENT_]?: Node|null};

export class ResolvedSlotLocator<T> extends ResolvedRenderableLocator<T|null> {
  constructor(
      private readonly parentElementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
      private readonly slotName_: string,
      private readonly converter_: Renderer<T, Node>,
      type: Type<T>) {
    super(instanceStreamId(`${parentElementLocator_}.slot(${slotName_})`, type));
  }

  startRender(vine: VineImpl, context: BaseDisposable): () => void {
    return vine.listen((parentEl, value) => {
      if (!parentEl) {
        return;
      }

      const childNodes = ImmutableList.of(parentEl.childNodes);
      const slotNode = findCommentNode<T>(childNodes, this.slotName_);

      if (!slotNode) {
        return;
      }

      if (value === null) {
        return;
      }

      const oldNode = slotNode[SLOT_ELEMENT_] || null;
      const newNode = this.converter_.render(value, oldNode);
      slotNode[SLOT_ELEMENT_] = newNode;
      if (newNode !== oldNode) {
        if (oldNode) {
          parentEl.removeChild(oldNode);
        }
        parentEl.insertBefore(newNode, slotNode.nextSibling);
      }
    }, context, this.parentElementLocator_.getReadingId(), this.getWritingId());
  }
}

export class UnresolvedSlotLocator<T>
    extends UnresolvedRenderableLocator<T|null> {
  constructor(
      private readonly parentElementLocator_: UnresolvedWatchableLocator<HTMLElement|null>,
      private readonly slotName_: string,
      private readonly converter_: Renderer<T, Node>,
      private readonly type_: Type<T>) {
    super();
  }

  resolve(resolver: LocatorPathResolver): ResolvedSlotLocator<T> {
    return new ResolvedSlotLocator(
        this.parentElementLocator_.resolve(resolver),
        this.slotName_,
        this.converter_,
        this.type_);
  }
}

type SlotLocator<T> = ResolvedSlotLocator<T>|UnresolvedSlotLocator<T>;
export function slot<T>(
    parentElement: UnresolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    renderer: Renderer<T, Node>,
    type: Type<T>): UnresolvedSlotLocator<T>;
export function slot<T>(
    parentElement: ResolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    renderer: Renderer<T, Node>,
    type: Type<T>): ResolvedSlotLocator<T>;
export function slot<T>(
    parentElement: UnresolvedWatchableLocator<HTMLElement|null>|
        ResolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    renderer: Renderer<T, Node>,
    type: Type<T>): SlotLocator<T> {
  if (parentElement instanceof UnresolvedWatchableLocator) {
    return new UnresolvedSlotLocator(parentElement, slotName, renderer, type);
  } else {
    return new ResolvedSlotLocator(parentElement, slotName, renderer, type);
  }
}

export function findCommentNode<T>(
    childNodes: ImmutableList<Node>,
    commentContent: string): SlotNode|null {
  return childNodes.find(node => {
    return node.nodeName === '#comment' && node.nodeValue === commentContent;
  });
}
