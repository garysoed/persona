import {Observable} from 'rxjs';

import {renderBase} from './render-base';
import {RenderNodeSpec} from './types/render-node-spec';


export function renderNode<N extends Node>(spec: RenderNodeSpec<N>): Observable<N> {
  return renderBase(spec, spec.node);
}
