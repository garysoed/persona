import {Observable, of} from 'rxjs';

import {applyDecorators} from './decorators/apply-decorators';
import {BaseRenderSpec} from './types/base-render-spec';


export function renderBase<N extends Node>(
    spec: BaseRenderSpec<N>,
    node: N,
): Observable<N> {
  if (!spec.decorators) {
    return of(node);
  } else {
    return applyDecorators(node, ...spec.decorators);
  }
}
