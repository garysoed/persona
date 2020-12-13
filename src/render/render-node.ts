import {Observable, of as observableOf} from 'rxjs';

import {NodeWithId} from './node-with-id';
import {setId} from './set-id';
import {RenderNodeSpec} from './types/render-node-spec';


export function renderNode(spec: RenderNodeSpec): Observable<NodeWithId<Node>> {
  return observableOf(setId(spec.node, spec.id));
}
