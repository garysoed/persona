import {Observable, of} from 'rxjs';

import {setId} from './set-id';
import {BaseRenderSpec} from './types/base-render-spec';
import {NodeWithId} from './types/node-with-id';


export function renderBase<N extends Node>(
    spec: BaseRenderSpec,
    node: N,
): Observable<NodeWithId<N>> {
  const nodeWithId = setId(node, spec.id);
  // if (!spec.decorators) {
  return of(nodeWithId);
  // } else {
  //   return applyDecorators(nodeWithId, ...spec.decorators);
  // }
}
