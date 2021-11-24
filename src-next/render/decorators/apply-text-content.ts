import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {NodeWithId} from '../types/node-with-id';


import {Decorator} from './apply-decorators';


export function applyTextContent(
    textContent: Observable<string|undefined>,
): Decorator<NodeWithId<Node>> {
  return node => textContent.pipe(
      tap(text => {
        node.textContent = text ?? '';
      }),
  );
}