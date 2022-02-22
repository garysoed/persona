import {Decorator} from '../decorators/apply-decorators';


export interface BaseRenderSpec<N extends Node> {
  readonly decorators?: ReadonlyArray<Decorator<N>>;
}