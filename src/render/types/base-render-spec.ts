import {Decorator} from '../apply-decorators';
import {NodeWithId} from '../node-with-id';


export interface BaseRenderSpec<N extends Node> {
  readonly id: unknown;
  readonly decorator?: Decorator<NodeWithId<N>>;
}