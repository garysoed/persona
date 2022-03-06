import {Observable, of} from 'rxjs';

import {RenderNodeSpec} from './types/render-node-spec';


export function renderNode<N extends Node>(spec: RenderNodeSpec<N>): Observable<N> {
  return of(spec.node);
}
