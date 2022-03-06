import {Observable} from 'rxjs';

import {Decorator} from './decorators/apply-decorators';
import {renderNode} from './render-node';
import {RenderContext} from './types/render-context';
import {RenderElementSpec} from './types/render-element-spec';
import {RenderSpecType} from './types/render-spec-type';


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
    context: RenderContext,
): Observable<HTMLElement> {
  const decorators: Array<Decorator<HTMLElement>> = [];

  if (spec.decorators) {
    decorators.push(...spec.decorators);
  }

  return renderNode({
    ...spec,
    type: RenderSpecType.NODE,
    node: context.document.createElement(spec.tag),
    decorators,
  });
}
