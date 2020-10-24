export const __id = Symbol('id');

export type NodeWithId<N extends Node> = N & {[__id]: {}};
