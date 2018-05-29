import { InstanceSourceId, NodeId } from 'grapevine/export/component';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ResolvedRenderableLocator } from '../locator/locator';

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
  componentClass: typeof BaseDisposable;
  renderers?: Iterable<RendererSpec>;
  sources?: Iterable<InstanceSourceId<any>>;
  tag: string;
  templateKey: string;
}
