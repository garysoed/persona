import {Observable, of as observableOf} from 'rxjs';

import {applyDecorators} from './decorators/apply-decorators';
import {NodeWithId} from './node-with-id';
import {setId} from './set-id';
import {BaseRenderSpec} from './types/base-render-spec';


export function renderBase<N extends Node>(
    spec: BaseRenderSpec<N>,
    node: N,
): Observable<NodeWithId<N>> {
  const nodeWithId = setId(node, spec.id);
  if (!spec.decorator) {
    return observableOf(nodeWithId);
  } else {
    return applyDecorators(nodeWithId, spec.decorator);
  }
}
