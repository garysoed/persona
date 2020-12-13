import {Observable} from 'rxjs';

import {NodeWithId} from './node-with-id';
import {renderBase} from './render-base';
import {RenderNodeSpec} from './types/render-node-spec';


export function renderNode<N extends Node>(spec: RenderNodeSpec<N>): Observable<NodeWithId<N>> {
  return renderBase(spec, spec.node);
}
