import {instanceofType} from 'gs-types';

import {ElementHarness} from './element-harness';

export class InputHarness<
  E extends HTMLInputElement,
> extends ElementHarness<E> {
  static override readonly validType = instanceofType(HTMLInputElement);

  simulateChange(modifierFn: (element: HTMLInputElement) => void): Event {
    modifierFn(this.target);
    const event = new Event('change');
    this.target.dispatchEvent(event);
    return event;
  }
}
