import { InstanceSourceId, NodeId } from 'grapevine/export/component';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ResolvedLocator, ResolvedRenderableLocator } from '../locator/locator';

export interface RendererSpec<T> {
  locator: ResolvedRenderableLocator<any>;
  parameters?: NodeId<any>[];
  propertyKey: string | symbol;
}

export interface ComponentSpec {
  componentClass: typeof BaseDisposable;
  renderers?: Iterable<RendererSpec<any>>;
  sources?: Iterable<InstanceSourceId<any>>;
  tag: string;
  templateKey: string;
}
