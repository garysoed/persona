import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Converter } from 'gs-tools/src/converter/converter';
import { Type } from 'gs-types/export';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedRenderableLocator, UnresolvedWatchableLocator } from './unresolved-locator';

export const SLOT_ELEMENT_ = Symbol('slotElement');
export const SLOT_VALUE_ = Symbol('slotValue');
type SlotNode<T> = Node & {[SLOT_ELEMENT_]?: Node|null; [SLOT_VALUE_]?: T|null};

export class ResolvedSlotLocator<T> extends ResolvedRenderableLocator<T|null> {
  constructor(
      private readonly parentElementLocator_: ResolvedWatchableLocator<HTMLElement|null>,
      private readonly slotName_: string,
      private readonly converter_: Converter<T, Node>,
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

      const currentValue = slotNode[SLOT_VALUE_];
      if (currentValue === value) {
        return;
      }
      slotNode[SLOT_VALUE_] = value;

      // Delete the old element.
      const currentElement = slotNode[SLOT_ELEMENT_];
      if (currentElement) {
        slotNode[SLOT_ELEMENT_] = null;
        parentEl.removeChild(currentElement);
      }

      const newNode = this.converter_.convertForward(value);
      if (!newNode) {
        return;
      }

      slotNode[SLOT_ELEMENT_] = newNode;
      parentEl.insertBefore(newNode, slotNode.nextSibling);
    }, context, this.parentElementLocator_.getReadingId(), this.getWritingId());
  }
}

export class UnresolvedSlotLocator<T> extends UnresolvedRenderableLocator<T|null> {
  constructor(
      private readonly parentElementLocator_: UnresolvedWatchableLocator<HTMLElement|null>,
      private readonly slotName_: string,
      private readonly converter_: Converter<T, Node>,
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
    converter: Converter<T, Node>,
    type: Type<T>): UnresolvedSlotLocator<T>;
export function slot<T>(
    parentElement: ResolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    converter: Converter<T, Node>,
    type: Type<T>): ResolvedSlotLocator<T>;
export function slot<T>(
    parentElement: UnresolvedWatchableLocator<HTMLElement|null>|
        ResolvedWatchableLocator<HTMLElement|null>,
    slotName: string,
    converter: Converter<T, Node>,
    type: Type<T>): SlotLocator<T> {
  if (parentElement instanceof UnresolvedWatchableLocator) {
    return new UnresolvedSlotLocator(parentElement, slotName, converter, type);
  } else {
    return new ResolvedSlotLocator(parentElement, slotName, converter, type);
  }
}

export function findCommentNode<T>(
    childNodes: ImmutableList<Node>,
    commentContent: string): SlotNode<T>|null {
  return childNodes.find(node => {
    return node.nodeName === '#comment' && node.nodeValue === commentContent;
  });
}
