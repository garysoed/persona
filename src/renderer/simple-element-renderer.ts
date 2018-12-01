import { Converter } from 'nabu/export/main';
import { __renderId } from './render-id';
import { Renderer } from './renderer';

export const __nodeId = Symbol('nodeId');

export interface Value {
  [key: string]: any;
}

export interface RenderValue {
  [__renderId]: string;
}

export type ValueWithId<V extends Value> = {[__renderId]: string} & V;

type ConvertersOf<T extends Value> = {
  [K in keyof T]: Converter<T[K], string>;
};

type ElementWithId = Element & {[__nodeId]: string};

export class SimpleElementRenderer<T extends Value> implements
    Renderer<ValueWithId<T>, ElementWithId> {
  constructor(
      private readonly tagName_: string,
      private readonly attributeConverters_: ConvertersOf<T>,
  ) { }

  private getElement_(currentId: string, previousRender: ElementWithId|null): ElementWithId {
    if (previousRender && previousRender[__nodeId] === currentId) {
      return previousRender;
    }

    const el = document.createElement(this.tagName_);

    return Object.assign(el, {[__nodeId]: currentId});
  }

  render(
      currentValue: ValueWithId<T>,
      previousRender: ElementWithId|null,
      parentNode: Node,
      insertionPoint: Node,
  ): ElementWithId {
    const el = this.getElement_(currentValue[__renderId], previousRender);
    for (const key in this.attributeConverters_) {
      if (this.attributeConverters_.hasOwnProperty(key)) {
        const result = this.attributeConverters_[key].convertForward(currentValue[key]);
        if (result.success) {
          el.setAttribute(key, result.result);
        }
      }
    }

    parentNode.insertBefore(el, insertionPoint.nextSibling);

    return el;
  }
}
