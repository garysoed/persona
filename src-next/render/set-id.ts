import {__id} from './types/node-with-id';

export function setId<N extends Node>(node: N, id: unknown): N&{[__id]: unknown} {
  return Object.assign(node, {[__id]: id});
}
