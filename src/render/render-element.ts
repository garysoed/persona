import {Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {RenderSpecType} from '../../export';
import {PersonaContext} from '../core/persona-context';
import {ownerDocument} from '../input/owner-document';

import {applyChildren} from './decorators/apply-children';
import {applyDecorators, Decorator} from './decorators/apply-decorators';
import {applyTextContent} from './decorators/apply-text-content';
import {NodeWithId, __id} from './node-with-id';
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

            if (spec.children) {
              decorators.push(applyChildren(spec.children, context));
            }

            if (spec.decorator) {
              decorators.push(spec.decorator);
            }

            return applyDecorators(el, ...decorators);
          },
        });
      }),
  );
}
