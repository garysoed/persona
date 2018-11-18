import { MatchOptions } from '../event/keydown-listener';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator, ResolvedWatchableLocators } from '../locator/resolved-locator';
import { CustomElementCtrl } from './custom-element-ctrl';

/**
 * Specifications for a renderer.
 */
export interface RendererSpec {
  locator: ResolvedRenderableLocator<any>;
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

export interface BaseComponentSpec {
  keydownSpecs?: Iterable<OnKeydownSpec>;
  listeners?: Iterable<OnDomSpec>;
  renderers?: Iterable<RendererSpec>;
  watchers?: Iterable<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>;
}

/**
 * Specifications for a custom element.
 */
export interface ComponentSpec {
  componentClass: new () => CustomElementCtrl;
  tag: string;
  template: string;
}

export type InputSpec = ResolvedWatchableLocators;
