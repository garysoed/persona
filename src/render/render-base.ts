import {EMPTY, Observable} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {applyDecorators} from './apply-decorators';
import {NodeWithId} from './node-with-id';
import {setId} from './set-id';
import {BaseRenderSpec} from './types/base-render-spec';


export function renderBase<N extends Node>(
    spec: BaseRenderSpec<N>,
    node: N,
): Observable<NodeWithId<N>> {
  return applyDecorators(
      setId(node, spec.id),
      (nodeWithId: NodeWithId<N>) => {
        return spec.decorator ?
          spec.decorator(nodeWithId).pipe(switchMapTo(EMPTY)) :
          EMPTY;
      },
  );
}
