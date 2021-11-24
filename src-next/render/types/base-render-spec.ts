import {Decorator} from '../decorators/apply-decorators';

import {NodeWithId} from './node-with-id';

export interface BaseRenderSpec<N extends Node> {
  readonly id: unknown;
  readonly decorators?: ReadonlyArray<Decorator<NodeWithId<N>>>;
}