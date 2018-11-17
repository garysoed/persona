import { ImmutableList } from 'gs-tools/export/collect';
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
    const previousChildren = previousRender || ImmutableList.of([]);
    const currentIds = currentValues.mapItem(value => value[__renderId]);

    // Delete children that have been deleted.
    let newChildren = previousChildren;
    for (let i = 0; i < newChildren.size();) {
      const previousChild = newChildren.getAt(i);
      if (previousChild === undefined) {
        i++;
        continue;
      }

      const id = previousChild[__nodeId];
      if (currentIds.has(id)) {
        i++;
        continue;
      }

      // TODO: Add animation.
      previousChild.remove();
      newChildren = newChildren.deleteAt(i);
    }

    // Add the new children.
    let p = 0;
    for (let c = 0; c < currentValues.size(); c++) {
      const currentValue = currentValues.getAt(c);
      if (currentValue === undefined) {
        continue;
      }
      const currentId = currentValue[__renderId];

      const previousChild = newChildren.getAt(p);
      // There are no child at this spot, so insert at the end.
      if (!previousChild) {
        const lastNewChild = newChildren.getAt(newChildren.size() - 1) || insertionPoint;
        const newNode = Object.assign(
            this.itemRenderer_.render(
                currentValue,
                null,
                parentNode,
                lastNewChild),
            {[__nodeId]: currentId});
        if (newNode) {
          newChildren = newChildren.insertAt(c, newNode);
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
        newChildren = newChildren.insertAt(c, newNode);
      }
    }

    return newChildren;
  }
}

export function getId_(element: Element & {[__nodeId]?: string}): string|null {
  return element[__nodeId] || null;
}

