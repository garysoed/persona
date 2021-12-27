import {Observable} from 'rxjs';

import {renderBase} from './render-base';
import {NodeWithId} from './types/node-with-id';
import {RenderNodeSpec} from './types/render-node-spec';


export function renderNode<N extends Node>(spec: RenderNodeSpec<N>): Observable<NodeWithId<N>> {
  return renderBase(spec, spec.node);
}
