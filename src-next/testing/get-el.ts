import {instanceofType, Type} from 'gs-types';

import {setBoundingClientRect} from './fake-rect';
import {dispatchResizeEvent} from './fake-resize-observer';

interface Options {
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly shiftKey?: boolean;
}

interface ClickEvents {
  readonly down: MouseEvent;
  readonly up: MouseEvent;
  readonly click: MouseEvent;
}

interface MouseOutEvents {
  readonly leaves: readonly MouseEvent[];
  readonly out: MouseEvent;
}

interface MouseOverEvents {
  readonly enters: readonly MouseEvent[];
  readonly over: MouseEvent;
}

type Harness = HTMLElement & {
  simulateChange(modifierFn: (el: HTMLInputElement) => void): Event;
  simulateClick(): ClickEvents;
  simulateKeydown(key: string, options?: Options): KeyboardEvent;
  simulateMouseOut(): MouseOutEvents;
  simulateMouseOver(): MouseOverEvents;
  simulateResize(newRect: DOMRect): Event;
};

const INPUT_EL_TYPE: Type<HTMLInputElement> = instanceofType(HTMLInputElement);

export function getEl(el: HTMLElement, id: string): Harness|null {
  const element = el.shadowRoot?.getElementById(id) ?? null;
  if (!element) {
    return null;
  }

  return Object.assign(element, {
    simulateChange(modifierFn: (element: HTMLInputElement) => void): Event {
      INPUT_EL_TYPE.assert(element);
      modifierFn(element);
      const event = new CustomEvent('change');
      element.dispatchEvent(event);
      return event;
    },

    simulateClick(): ClickEvents {
      const down = new MouseEvent('mousedown');
      element.dispatchEvent(down);
      const up = new MouseEvent('mouseup');
      element.dispatchEvent(up);
      const click = new MouseEvent('click');
      element.dispatchEvent(click);
      return {down, up, click};
    },

    simulateMouseOut(): MouseOutEvents {
      const out = new MouseEvent('mouseout');
      element.dispatchEvent(out);

      const leaves: MouseEvent[] = [];
      let curr: HTMLElement|null = element;
      while(curr !== null) {
        const enter = new MouseEvent('mouseleave');
        curr.dispatchEvent(enter);
        leaves.push(enter);
        curr = curr.parentElement;
      }

      return {leaves, out};
    },

    simulateMouseOver(): MouseOverEvents {
      const over = new MouseEvent('mouseover');
      element.dispatchEvent(over);

      const enters: MouseEvent[] = [];
      let curr: HTMLElement|null = element;
      while(curr !== null) {
        const enter = new MouseEvent('mouseenter');
        curr.dispatchEvent(enter);
        enters.push(enter);
        curr = curr.parentElement;
      }

      return {enters, over};
    },

    simulateKeydown(key: string, options: Options = {}): KeyboardEvent {
      const event = new KeyboardEvent('keydown', {key, ...options});
      element.dispatchEvent(event);
      return event;
    },

    simulateResize(newRect: DOMRect): Event {
      setBoundingClientRect(element, newRect);
      return dispatchResizeEvent(element, [{contentRect: newRect}]);
    },
  });
}
