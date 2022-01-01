import {instanceofType} from 'gs-types';

import {ElementHarness} from './element-harness';

export class InputHarness<E extends HTMLInputElement> extends ElementHarness<E> {
  static readonly validType = instanceofType(HTMLInputElement);

  simulateChange(modifierFn: (element: HTMLInputElement) => void): Event {
    modifierFn(this.element);
    const event = new CustomEvent('change');
    this.element.dispatchEvent(event);
    return event;
  }
}