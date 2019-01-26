import { VineImpl } from 'grapevine/export/main';
import { Observable } from 'rxjs';
import { Input } from '../component/input';
import { Output } from '../component/output';
import { CustomElementCtrl } from './custom-element-ctrl';

/**
 * Specifications for a renderer.
 */
export interface RendererSpec {
  output?: Output<any>;
  propertyKey: string|symbol;
  target: Object;
}

export type OnCreateHandler = (
    context: CustomElementCtrl,
    vine: VineImpl,
    root: ShadowRoot,
) => Observable<unknown>;

export interface OutputSpec {
  output: Output<any>;
  propertyKey: string|symbol;
  target: Object;
}

/**
 * Specifications for a custom element.
 */
export interface ComponentSpec {
  componentClass: new () => CustomElementCtrl;
  tag: string;
  template: string;
}
