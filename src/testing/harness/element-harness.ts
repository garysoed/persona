import {instanceofType} from 'gs-types';

import {setBoundingClientRect} from '../fake-rect';
import {dispatchResizeEvent} from '../fake-resize-observer';

import {Harness} from './harness';


interface ClickEvents {
  readonly down: MouseEvent;
  readonly up: MouseEvent;
  readonly click: MouseEvent;
}

interface KeyOptions {
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly shiftKey?: boolean;
}

interface MouseOutEvents {
  readonly leaves: readonly MouseEvent[];
  readonly out: MouseEvent;
}

interface MouseOverEvents {
  readonly enters: readonly MouseEvent[];
  readonly over: MouseEvent;
}

export class ElementHarness<E extends Element> implements Harness<E> {
  static readonly validType = instanceofType(Element);

  constructor(
      readonly element: E,
      readonly hostElement: Element,
  ) { }

  simulateClick(): ClickEvents {
    const down = new MouseEvent('mousedown');
    this.element.dispatchEvent(down);
    const up = new MouseEvent('mouseup');
    this.element.dispatchEvent(up);
    const click = new MouseEvent('click');
    this.element.dispatchEvent(click);
    return {down, up, click};
  }

  simulateKeydown(key: string, options?: KeyOptions): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {key, ...options});
    this.element.dispatchEvent(event);
    return event;
  }

  simulateMouseOut(): MouseOutEvents {
    const out = new MouseEvent('mouseout');
    this.element.dispatchEvent(out);

    const leaves: MouseEvent[] = [];
    let curr: Element|null = this.element;
    while(curr !== null) {
      const enter = new MouseEvent('mouseleave');
      curr.dispatchEvent(enter);
      leaves.push(enter);
      curr = curr.parentElement;
    }

    return {leaves, out};
  }

  simulateMouseOver(): MouseOverEvents {
    const over = new MouseEvent('mouseover');
    this.element.dispatchEvent(over);

    const enters: MouseEvent[] = [];
    let curr: Element|null = this.element;
    while(curr !== null) {
      const enter = new MouseEvent('mouseenter');
      curr.dispatchEvent(enter);
      enters.push(enter);
      curr = curr.parentElement;
    }

    return {enters, over};
  }

  simulateResize(newRect: DOMRect): Event {
    setBoundingClientRect(this.element, newRect);
    return dispatchResizeEvent(this.element, [{contentRect: newRect}]);
  }
}
