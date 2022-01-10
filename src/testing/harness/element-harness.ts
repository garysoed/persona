import {instanceofType} from 'gs-types';

import {triggerFakeMutation} from '../fake-mutation-observer';
import {setBoundingClientRect} from '../fake-rect';
import {dispatchResizeEvent} from '../fake-resize-observer';

import {EventTargetHarness} from './event-target-harness';


interface MouseOutEvents {
  readonly leaves: readonly MouseEvent[];
  readonly out: MouseEvent;
}

interface MouseOverEvents {
  readonly enters: readonly MouseEvent[];
  readonly over: MouseEvent;
}

export class ElementHarness<E extends Element> extends EventTargetHarness<E> {
  static readonly validType = instanceofType(Element);

  constructor(
      readonly target: E,
      readonly hostElement: Element,
  ) {
    super(target);
  }

  simulateMouseOut(): MouseOutEvents {
    const out = new MouseEvent('mouseout');
    this.target.dispatchEvent(out);

    const leaves: MouseEvent[] = [];
    let curr: Element|null = this.target;
    while(curr !== null) {
      const enter = new MouseEvent('mouseleave');
      curr.dispatchEvent(enter);
      leaves.push(enter);
      curr = curr.parentElement;
    }

    return {leaves, out};
  }

  simulateMouseOver(options: MouseEventInit = {}): MouseOverEvents {
    const over = new MouseEvent('mouseover');
    this.target.dispatchEvent(over);

    const enters: MouseEvent[] = [];
    let curr: Element|null = this.target;
    while(curr !== null) {
      const enter = new MouseEvent('mouseenter', options);
      curr.dispatchEvent(enter);
      enters.push(enter);
      curr = curr.parentElement;
    }

    return {enters, over};
  }

  simulateMutation(record: {} = {}): void {
    triggerFakeMutation(this.target, record);
  }

  simulateResize(newRect: DOMRect): Event {
    setBoundingClientRect(this.target, newRect);
    return dispatchResizeEvent(this.target, [{contentRect: newRect}]);
  }
}
