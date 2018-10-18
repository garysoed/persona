import { ImmutableList } from 'gs-tools/export/collect';
import { __renderId } from './render-id';
import { Renderer } from './renderer';

export const __nodeId = Symbol('nodeId');

type ElementWithId = Element & {[__nodeId]: string};

export class ElementListRenderer<V extends {[__renderId]: string}> implements
    Renderer<ImmutableList<V>, DocumentFragment> {
  constructor(private readonly itemRenderer_: Renderer<V, Element>) { }

  render(currentValues: ImmutableList<V>, previousRender: DocumentFragment|null):
      DocumentFragment {
    const docFragment = previousRender || document.createDocumentFragment();

    const previousChildren = ImmutableList.of(docFragment.children)
        .filterItem((child: Partial<ElementWithId>): child is ElementWithId => !!child[__nodeId]);
    const currentIds = currentValues.mapItem(value => value[__renderId]);

    // Delete children that have been deleted.
    let trimmedPreviousChildren = previousChildren;
    for (let i = 0; i < trimmedPreviousChildren.size();) {
      const previousChild = trimmedPreviousChildren.getAt(i);
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
      trimmedPreviousChildren = trimmedPreviousChildren.deleteAt(i);
    }

    // Add the new children.
    let p = 0;
    for (let c = 0; c < currentValues.size(); c++) {
      const currentValue = currentValues.getAt(c);
      if (currentValue === undefined) {
        continue;
      }
      const currentId = currentValue[__renderId];

      // There are no child at this spot, so insert at the end.
      const previousChild = trimmedPreviousChildren.getAt(p);
      if (!previousChild) {
        const newNode = Object.assign(
            this.itemRenderer_.render(currentValue, null),
            {[__nodeId]: currentId});
        if (newNode) {
          docFragment.appendChild(newNode);
          trimmedPreviousChildren = trimmedPreviousChildren.insertAt(c, newNode);
        }
        continue;
      }

      const previousId = previousChild[__nodeId];
      if (currentId === previousId) {
        p++;
        continue;
      }

      const newNode = Object.assign(
          this.itemRenderer_.render(currentValue, null),
          {[__nodeId]: currentId});
      if (newNode) {
        p++;
        docFragment.insertBefore(newNode, previousChild);
        trimmedPreviousChildren = trimmedPreviousChildren.insertAt(c, newNode);
      }
    }

    return docFragment;
  }
}

export function getId_(element: Element & {[__nodeId]?: string}): string|null {
  return element[__nodeId] || null;
}

