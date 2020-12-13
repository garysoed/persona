import {EMPTY, merge, Observable, of as observableOf} from 'rxjs';
import {mapTo} from 'rxjs/operators';

import {NodeWithId} from './node-with-id';


export type Decorator<N> = (node: N) => Observable<unknown>;

export function applyDecorators<N extends NodeWithId<Node>>(
    node: N,
    ...decorators: ReadonlyArray<Decorator<N>>
): Observable<N> {
  const obs$list = decorators.map(decorator => {
    return decorator(node).pipe(mapTo(EMPTY));
  });
  return merge(
      observableOf(node),
      ...obs$list,
  );
}