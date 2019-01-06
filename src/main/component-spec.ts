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

export interface OnCreateSpec {
  propertyKey: string|symbol;
  target: Object;
}

export interface OutputSpec {
  output: Output<any>;
  propertyKey: string|symbol;
  target: Object;
}

/**
 * Specification for a base custom element that doesn't get initialized.
 */
export interface BaseComponentSpec {
  input?: Iterable<Input<any>>;
  onCreate?: Iterable<OnCreateSpec>;
  renderers?: Iterable<RendererSpec>;
}

/**
 * Specifications for a custom element.
 */
export interface ComponentSpec {
  componentClass: new () => CustomElementCtrl;
  tag: string;
  template: string;
}
