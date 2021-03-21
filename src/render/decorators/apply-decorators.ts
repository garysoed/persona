import {EMPTY, merge, Observable, of} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {NodeWithId} from '../node-with-id';


export type Decorator<N extends NodeWithId<Node>> = (node: N) => Observable<unknown>;

export function applyDecorators<N extends NodeWithId<Node>>(
    node: N,
    ...decorators: ReadonlyArray<Decorator<N>>
): Observable<N> {
  const obs$list: ReadonlyArray<Observable<N>> = decorators.map(decorator => {
    return decorator(node).pipe(switchMapTo(EMPTY));
  });
  return merge<N>(of(node), ...obs$list);
}