import {hasPropertiesType, instanceofType, intersectType, notType, undefinedType} from 'gs-types';

export const __id = Symbol('id');

export type NodeWithId<N extends Node> = N & {[__id]: unknown};

export const NODE_WITH_ID_TYPE = intersectType([
  instanceofType(Node),
  hasPropertiesType({
    [__id]: notType(undefinedType),
  }),
]);

export function equalNodes(a: NodeWithId<Node>, b: NodeWithId<Node>): boolean {
  return a[__id] === b[__id];
}