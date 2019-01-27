import { $deleteAt, $pipe, $hasEntry, $head, $insertAt, $map, $size, $skip, asImmutableList, createImmutableList, ImmutableList } from 'gs-tools/export/collect';
import { __renderId } from './render-id';
import { Renderer } from './renderer';

export const __nodeId = Symbol('nodeId');

export type ElementWithId = Element & {[__nodeId]: string};

export class ElementListRenderer<V extends {[__renderId]: string}> implements
    Renderer<ImmutableList<V>, ImmutableList<ElementWithId>> {
  constructor(private readonly itemRenderer_: Renderer<V, Element>) { }

  render(
      currentValues: ImmutableList<V>,
      previousRender: ImmutableList<ElementWithId>|null,
      parentNode: Node,
      insertionPoint: Node,
  ): ImmutableList<ElementWithId> {
    const previousChildren = previousRender || createImmutableList([]);
    const currentIds = $pipe(currentValues, $map(value => value[__renderId]));

    // Delete children that have been deleted.
    let newChildren = previousChildren;
    for (let i = 0; i < $pipe(newChildren, $size());) {
      const previousChild = $pipe(newChildren, $skip(i), $head());
      if (previousChild === undefined) {
        i++;
        continue;
      }

      const id = previousChild[__nodeId];
      if ($pipe(currentIds, $hasEntry(id))) {
        i++;
        continue;
      }

      // TODO: Add animation.
      previousChild.remove();
      newChildren = $pipe(newChildren, $deleteAt(i), asImmutableList());
    }

    // Add the new children.
    let p = 0;
    for (let c = 0; c < $pipe(currentValues, $size()); c++) {
      const currentValue = $pipe(currentValues, $skip(c), $head());
      if (currentValue === undefined) {
        continue;
      }
      const currentId = currentValue[__renderId];

      const previousChild = $pipe(newChildren, $skip(p), $head());
      // There are no child at this spot, so insert at the end.
      if (!previousChild) {
        const lastNewChild = $pipe(
            newChildren,
            $skip($pipe(newChildren, $size()) - 1),
            $head(),
        ) || insertionPoint;
        const newNode = Object.assign(
            this.itemRenderer_.render(
                currentValue,
                null,
                parentNode,
                lastNewChild,
            ),
            {[__nodeId]: currentId});
        if (newNode) {
          newChildren = $pipe(newChildren, $insertAt([newNode, c]), asImmutableList());
          p++;
        }
        continue;
      }

      const previousId = previousChild[__nodeId];
      if (currentId === previousId) {
        this.itemRenderer_.render(
            currentValue,
            previousChild,
            parentNode,
            previousChild.previousSibling);
        p++;
        continue;
      }

      const newNode = Object.assign(
          this.itemRenderer_.render(currentValue, null, parentNode, previousChild.previousSibling),
          {[__nodeId]: currentId});
      if (newNode) {
        p++;
        newChildren = $pipe(newChildren, $insertAt([newNode, c]), asImmutableList());
      }
    }

    return newChildren;
  }
}

export function getId_(element: Element & {[__nodeId]?: string}): string|null {
  return element[__nodeId] || null;
}

