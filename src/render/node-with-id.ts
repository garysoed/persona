export const __id = Symbol('id');

export type NodeWithId = Node & {[__id]: any};
