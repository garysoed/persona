import { __id } from './node-with-id';

export function setId<N extends Node>(node: N, id: {}): N&{[__id]: {}} {
  return Object.assign(node, {[__id]: id});
}
