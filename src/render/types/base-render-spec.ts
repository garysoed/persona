import {RenderSpecType} from './render-spec-type';

export interface BaseRenderSpec {
  readonly type: RenderSpecType;
  readonly id: unknown;
}