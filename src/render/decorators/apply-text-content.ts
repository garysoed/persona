import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {NodeWithId} from '../node-with-id';

import {Decorator} from './apply-decorators';


export function applyTextContent(
    textContent: Observable<string>,
): Decorator<NodeWithId<Node>> {
  return node => textContent.pipe(
      tap(text => {
        node.textContent = text;
      }),
  );
}