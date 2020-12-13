import {OperatorFunction} from 'rxjs';

import {NodeWithId} from '../node-with-id';

export interface BaseRenderSpec<N extends Node> {
  readonly id: unknown;
  readonly decorator?: OperatorFunction<NodeWithId<N>, NodeWithId<N>>;
}