import {Observable, of as observableOf} from 'rxjs';

import {NodeWithId} from './node-with-id';
import {setId} from './set-id';
import {RenderNodeSpec} from './types/render-node-spec';


export function renderNode<N extends Node>(spec: RenderNodeSpec<N>): Observable<NodeWithId<N>> {
  return observableOf(setId(spec.node, spec.id));
}
