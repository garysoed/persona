import { $exec, $filter, $head, createImmutableList, ImmutableList } from 'gs-tools/export/collect';
import { Observable } from 'rxjs';
import { scan, switchMap } from 'rxjs/operators';
import { Output } from '../component/output';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { Renderer } from '../renderer/renderer';

export const SLOT_ELEMENTS_ = Symbol('slotElement');
type SlotNode<R> = Node & {[SLOT_ELEMENTS_]?: R};

export class SlotOutput<T, R> implements Output<T> {
  constructor(
      private readonly renderer: Renderer<T, R>,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
      readonly slotName: string|null,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<T>): Observable<unknown> {
    return this.resolver(root)
        .pipe(
            switchMap(parentEl => {
              const slotNode = findCommentNode<R>(
                  createImmutableList(parentEl.childNodes),
                  this.slotName,
              );

              return valueObs.pipe(
                  scan<T, R|null>(
                      (prevRender, value) => this.renderer.render(
                          value,
                          prevRender,
                          parentEl,
                          slotNode,
                      ),
                      null,
                  ),
              );
            }),
        );
  }
}

class UnresolvedSlotOutput<T, R> implements UnresolvedElementProperty<Element, SlotOutput<T, R>> {
  constructor(
      private readonly renderer: Renderer<T, R>,
      readonly slotName: string|null,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): SlotOutput<T, R> {
    return new SlotOutput(this.renderer, resolver, this.slotName);
  }
}

export function slot<T, R>(renderer: Renderer<T, R>): UnresolvedSlotOutput<T, R>;
export function slot<T, R>(slotName: string, renderer: Renderer<T, R>): UnresolvedSlotOutput<T, R>;
export function slot<T, R>(
    slotNameOrRenderer: Renderer<T, R>|string|null,
    renderer?: Renderer<T, R>,
): UnresolvedSlotOutput<T, R> {
  if (typeof slotNameOrRenderer === 'object' && slotNameOrRenderer) {
    return new UnresolvedSlotOutput(slotNameOrRenderer, null);
  }

  if (!renderer) {
    throw new Error('Required renderer not found');
  }

  return new UnresolvedSlotOutput(renderer, slotNameOrRenderer);
}

export function findCommentNode<R>(
    childNodes: ImmutableList<Node>,
    commentContent: string|null,
): SlotNode<R>|null {
  if (!commentContent) {
    return null;
  }

  return $exec(
      childNodes,
      $filter(node => {
        return node.nodeName === '#comment' &&
            !!node.nodeValue &&
            node.nodeValue.trim() === commentContent;
      }),
      $head(),
  ) || null;
}
