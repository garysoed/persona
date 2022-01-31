import {arrayFrom} from 'gs-tools/export/collect';

import {NodeWithId, NODE_WITH_ID_TYPE} from '../render/types/node-with-id';

export function getContiguousChildNodesWithId(parent: Node): ReadonlyArray<NodeWithId<Node>> {
  const children: Array<NodeWithId<Node>> = [];
  for (const node of arrayFrom(parent.childNodes)) {
    if (!NODE_WITH_ID_TYPE.check(node)) {
      break;
    }

    children.push(node);
  }

  return children;
}

export function getContiguousSiblingNodesWithId(start: Node): ReadonlyArray<NodeWithId<Node>> {
  const children: Array<NodeWithId<Node>> = [];
  for (let current = start.nextSibling; current !== null; current = current.nextSibling) {
    if (!NODE_WITH_ID_TYPE.check(current)) {
      break;
    }

    children.push(current);
  }

  return children;
}