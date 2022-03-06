import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderSpecType} from './types/render-spec-type';
import {RenderTextNodeSpec} from './types/render-text-node-spec';


export function renderTextNode(
    spec: RenderTextNodeSpec,
    context: RenderContext,
): Observable<Text> {
  return spec.textContent.pipe(
      switchMap(text => {
        const node = context.document.createTextNode(text);
        return renderNode({
          ...spec,
          type: RenderSpecType.NODE,
          node,
        });
      }),
  );
}
