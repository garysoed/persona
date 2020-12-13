import {tap} from 'rxjs/operators';

import {NodeWithId} from '../node-with-id';
import {normalize, ObservableOrValue} from '../types/observable-or-value';

import {Decorator} from './apply-decorators';

export function applyTextContent(
    textContent: ObservableOrValue<string>,
): Decorator<NodeWithId<Node>> {
  return node => normalize(textContent).pipe(
      tap(text => {
        node.textContent = text;
      }),
  );
}