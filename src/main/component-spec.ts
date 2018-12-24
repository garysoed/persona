import { Input } from '../component/input';
import { Output } from '../component/output';
import { MatchOptions } from '../event/keydown-listener';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from './custom-element-ctrl';

/**
 * Specifications for a renderer.
 */
export interface RendererSpec {
  locator?: ResolvedRenderableLocator<any>;
  output?: Output<any>;
  propertyKey: string|symbol;
  target: Object;
}

export interface OnCreateSpec {
  propertyKey: string|symbol;
  target: Object;
}

/**
 * Specifications for a dom listener.
 */
export interface OnDomSpec {
  elementLocator: ResolvedWatchableLocator<Element>;
  eventName: string;
  options?: AddEventListenerOptions;
  propertyKey: string|symbol;
}

/**
 * Specifications for a keydown listener.
 */
export interface OnKeydownSpec {
  elementLocator: ResolvedWatchableLocator<Element>;
  key: string;
  matchOptions?: MatchOptions;
  options?: AddEventListenerOptions;
  propertyKey: string|symbol;
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
  keydownSpecs?: Iterable<OnKeydownSpec>;
  listeners?: Iterable<OnDomSpec>;
  onCreate?: Iterable<OnCreateSpec>;
  renderers?: Iterable<RendererSpec>;
  watchers?: Iterable<ResolvedWatchableLocator<any>>;
}

/**
 * Specifications for a custom element.
 */
export interface ComponentSpec {
  componentClass: new () => CustomElementCtrl;
  tag: string;
  template: string;
}

export type InputSpec = ResolvedWatchableLocator<any>;
