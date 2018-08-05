import { NodeId } from 'grapevine/export/component';
import { MatchOptions } from '../event/keydown-listener';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from './custom-element-ctrl';

/**
 * Specifications for a renderer.
 */
export interface RendererSpec {
  locator: ResolvedRenderableLocator<any>;
  parameters?: NodeId<any>[];
  propertyKey: string|symbol;
}

/**
 * Specifications for a dom listener.
 */
export interface OnDomSpec {
  elementLocator: ResolvedWatchableLocator<HTMLElement|null>;
  eventName: string;
  options?: AddEventListenerOptions;
  propertyKey: string|symbol;
}

/**
 * Specifications for a keydown listener.
 */
export interface OnKeydownSpec {
  elementLocator: ResolvedWatchableLocator<HTMLElement|null>;
  key: string;
  matchOptions?: MatchOptions;
  options?: AddEventListenerOptions;
  propertyKey: string|symbol;
}

/**
 * Specifications for a custom element.
 */
export interface ComponentSpec {
  componentClass: new () => CustomElementCtrl;
  keydownSpecs?: Iterable<OnKeydownSpec>;
  listeners?: Iterable<OnDomSpec>;
  renderers?: Iterable<RendererSpec>;
  tag: string;
  template: string;
  watchers?: Iterable<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>;
}
