import {instanceofType} from 'gs-types';

import {ElementHarness} from './element-harness';

export class SlotHarness<E extends HTMLSlotElement> extends ElementHarness<E> {
  static readonly validType = instanceofType(HTMLSlotElement);

  simulateSlotChange(modifierFn: (hostEl: Element) => void): Event {
    const event = new CustomEvent('slotchange');
    modifierFn(this.hostElement);
    this.target.dispatchEvent(event);
    return event;
  }
}