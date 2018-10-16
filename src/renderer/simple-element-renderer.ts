import { Converter } from 'gs-tools/export/converter';
import { __id, Renderer, RenderValue } from './renderer';

export const __nodeId = Symbol('nodeId');

interface Value {
  [key: string]: any;
}

type ValueWithId<V extends Value> = {[__id]: string} & V;

type ConvertersOf<T extends Value> = {
  [K in keyof T]: Converter<T[K], string>;
};

type ElementWithId = HTMLElement & {[__nodeId]: string};

export class SimpleElementRenderer<T extends Value> implements
    Renderer<ValueWithId<T>, ElementWithId> {
  constructor(
      private readonly tagName_: string,
      private readonly attributeConverters_: ConvertersOf<T>) { }

  private getElement_(currentId: string, previousRender: ElementWithId|null): ElementWithId {
    if (previousRender && previousRender[__nodeId] === currentId) {
      return previousRender;
    }

    const el = document.createElement(this.tagName_);

    return Object.assign(el, {[__nodeId]: currentId});
  }

  render(currentValue: ValueWithId<T>, previousRender: ElementWithId|null): ElementWithId|null {
    const el = this.getElement_(currentValue[__id], previousRender);
    for (const key in this.attributeConverters_) {
      if (this.attributeConverters_.hasOwnProperty(key)) {
        const value = this.attributeConverters_[key].convertForward(currentValue[key]);
        if (value !== null) {
          el.setAttribute(key, value);
        }
      }
    }

    return el;
  }
}
