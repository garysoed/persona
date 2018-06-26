import { NodeId } from 'grapevine/export/component';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ResolvedLocator, ResolvedRenderableLocator } from '../locator/locator';
import { CustomElementCtrl } from './custom-element-ctrl';

/**
 * Specifications for a renderer.
 */
export interface RendererSpec {
  locator: ResolvedRenderableLocator<any>;
  parameters?: NodeId<any>[];
  propertyKey: string | symbol;
}

/**
 * Specifications for a custom element.
 */
export interface ComponentSpec {
  componentClass: new () => CustomElementCtrl;
  renderers?: Iterable<RendererSpec>;
  shadowMode?: 'open'|'closed';
  tag: string;
  template: string;
  watchers?: Iterable<ResolvedLocator<any>>;
}
