import {Vine} from 'grapevine';

export interface RenderContext {
  readonly document: Document;
  readonly vine: Vine;
}