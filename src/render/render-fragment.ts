import {combineLatest, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {render} from './render';
import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderFragmentSpec} from './types/render-fragment-spec';
import {RenderSpecType} from './types/render-spec-type';

export function renderFragment(
  spec: RenderFragmentSpec,
  context: RenderContext,
): Observable<DocumentFragment> {
  const children$List =
    spec.nodes.length > 0
      ? combineLatest(spec.nodes.map((spec) => render(spec, context)))
      : of([]);

  return children$List.pipe(
    switchMap((children) => {
      const fragment = context.document.createDocumentFragment();
      for (const child of children) {
        if (!child) {
          continue;
        }
        fragment.appendChild(child);
      }
      return renderNode({
        ...spec,
        node: fragment,
        type: RenderSpecType.NODE,
      });
    }),
  );
}
