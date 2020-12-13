import {$asArray, $filterNonNull, $pipe} from 'gs-tools/export/collect';
import {diffArray} from 'gs-tools/export/rxjs';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {RenderSpecType} from '../../export';
import {PersonaContext} from '../core/persona-context';
import {ownerDocument} from '../input/owner-document';

import {applyDecorators, Decorator} from './decorators/apply-decorators';
import {applyTextContent} from './decorators/apply-text-content';
import {NodeWithId, __id} from './node-with-id';
import {render} from './render';
import {renderNode} from './render-node';
import {normalize, ObservableOrValue} from './types/observable-or-value';
import {RenderElementSpec} from './types/render-element-spec';


/**
 * Values for rendering the element.
 *
 * @thHidden
 */
export interface Values {
  /**
   * Attributes to apply to the element.
   */
  readonly attrs?: ReadonlyMap<string, Observable<string|null>>;

  readonly children?: Observable<readonly Node[]>;

  /**
   * Text content of the element.
   */
  readonly textContent?: Observable<string>;
}

/**
 * Renders an element given the tag name, attribute, and text content.
 *
 * @param tagName - Tag name of the element to create.
 * @param values - Values to set to the element.
 * @param context - The Persona context.
 * @returns `Observable` that emits the created custom element. This only emits when the element is
 *     created and will not emit if any of the element's properties changes.
 *
 * @thModule render.
 */
export function renderElement(
    spec: RenderElementSpec,
    context: PersonaContext,
): Observable<HTMLElement&{[__id]: unknown}> {
  return ownerDocument().getValue(context).pipe(
      switchMap(document => {
        return renderNode({
          ...spec,
          type: RenderSpecType.NODE,
          node: document.createElement(spec.tag),
          decorator: el => {
            const decorators: Array<Decorator<NodeWithId<HTMLElement>>> = [];

            const extraAttrs = spec.attrs ?? new Map<string, ObservableOrValue<string|undefined>>();
            for (const [attrName, attrValue] of extraAttrs) {
              decorators.push(el => normalize(attrValue).pipe(
                  tap(value => {
                    if (value === undefined) {
                      el.removeAttribute(attrName);
                    } else {
                      el.setAttribute(attrName, value);
                    }
                  }),
              ));
            }

            if (spec.textContent) {
              decorators.push(applyTextContent(spec.textContent));
            }

            const children = spec.children;
            if (children) {
              decorators.push(() => normalize(children).pipe(
                  switchMap(specs => {
                    const renderedNode$list = specs.map(spec => render(spec, context));
                    if (renderedNode$list.length <= 0) {
                      return observableOf([]);
                    }

                    return combineLatest(renderedNode$list).pipe(
                        map(renderedNodes => $pipe(renderedNodes, $filterNonNull(), $asArray())),
                    );
                  }),
                  diffArray(),
                  tap(diff => {
                    switch (diff.type) {
                      case 'delete':
                        el.removeChild(diff.value);
                        break;
                      case 'init':
                        el.innerHTML = '';
                        for (const child of diff.value) {
                          el.appendChild(child);
                        }
                        break;
                      case 'insert':{
                        const insertBefore = el.children.item(diff.index);
                        el.insertBefore(diff.value, insertBefore);
                        break;
                      }
                      case 'set':{
                        const toDelete = el.children.item(diff.index);
                        const setBefore = toDelete?.nextSibling || null;
                        if (toDelete) {
                          el.removeChild(toDelete);
                        }
                        el.insertBefore(diff.value, setBefore);
                        break;
                      }
                    }
                  }),
              ));
            }

            return applyDecorators(el, ...decorators);
          },
        });
      }),
  );
}
