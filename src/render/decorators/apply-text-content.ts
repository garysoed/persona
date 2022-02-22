import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {Decorator} from './apply-decorators';


export function applyTextContent(textContent: Observable<string|undefined>): Decorator<Node> {
  return node => textContent.pipe(
      tap(text => {
        node.textContent = text ?? '';
      }),
  );
}