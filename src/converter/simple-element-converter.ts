import { Converter } from 'gs-tools/export/converter';
import { Type } from 'gs-types/export';

interface ConvertibleObject {
  [key: string]: any;
}

type ConvertersOf<T extends ConvertibleObject> = {
  [K in keyof T]: Converter<T[K], string>;
};

export class SimpleElementConverter<T extends ConvertibleObject> implements
    Converter<T, HTMLElement> {
  constructor(
      private readonly tagName_: string,
      private readonly attributeConverters_: ConvertersOf<T>,
      private readonly type_: Type<T>) { }

  convertBackward(value: Node|null): T|null {
    if (!value) {
      return null;
    }

    if (!(value instanceof HTMLElement)) {
      return null;
    }

    if (value.tagName.toLowerCase() !== this.tagName_) {
      return null;
    }

    const output: Partial<T> = {};
    for (const key in this.attributeConverters_) {
      if (this.attributeConverters_.hasOwnProperty(key)) {
        const attrValue = value.getAttribute(key);
        output[key] = this.attributeConverters_[key].convertBackward(attrValue);
      }
    }

    if (!this.type_.check(output)) {
      return null;
    }

    return output;
  }

  convertForward(input: T|null): HTMLElement|null {
    if (!input) {
      return null;
    }

    const el = document.createElement(this.tagName_);
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const value = this.attributeConverters_[key].convertForward(input[key]);
        if (value !== null) {
          el.setAttribute(key, value);
        }
      }
    }

    return el;
  }
}
