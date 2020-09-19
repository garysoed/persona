import { cache } from 'gs-tools/export/data';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PersonaContext } from '../core/persona-context';
import { Input } from '../types/input';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';


interface Properties {
  readonly [key: string]: UnresolvedElementProperty<Element, any>;
}

type Resolved<P extends Properties> = {
  [K in keyof P]: P[K] extends UnresolvedElementProperty<Element, infer R> ? R : never;
};

export class SlottedInput<P extends Properties> implements Input<Element> {

  constructor(
      private readonly slotId: string,
      private readonly properties: P,
      private readonly index: number,
  ) {
  }

  getValue({shadowRoot}: PersonaContext): Observable<Element> {
    const el = shadowRoot.getElementById(this.slotId);
    if (!(el instanceof HTMLSlotElement)) {
      throw new Error(`Element of [${this.slotId}] should be an HTMLSlotElement but was ${el}`);
    }
    return fromEvent(el, 'slotchange').pipe(
        startWith({}),
        map(() => el.assignedElements()[this.index]),
    );
  }

  @cache()
  get _(): Resolved<P> {
    const resolvedProperties: Resolved<any> = {};
    for (const key in this.properties) {
      if (!this.properties.hasOwnProperty(key)) {
        continue;
      }

      resolvedProperties[key] = this.properties[key].resolve(root => this.getValue(root));
    }

    return resolvedProperties;
  }
}

export function slotted<P extends Properties>(
    id: string,
    index: number,
    properties: P,
): SlottedInput<P>;
export function slotted<P extends Properties>(
    id: string,
    properties: P,
): SlottedInput<P>;
export function slotted(
    id: string,
    indexOrSpec: number|Properties,
    properties?: Properties,
): SlottedInput<Properties> {
  if (typeof indexOrSpec === 'number') {
    return new SlottedInput(id, properties!, indexOrSpec);
  } else {
    return new SlottedInput(id, indexOrSpec, 0);
  }
}
