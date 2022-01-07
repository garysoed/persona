import {instanceofType} from 'gs-types';

import {Harness} from './harness';

type ClickOptions = MouseEventInit;


interface ClickEvents {
  readonly down: MouseEvent;
  readonly up: MouseEvent;
  readonly click: MouseEvent;
}

export class EventTargetHarness<E extends EventTarget> implements Harness<E> {
  static readonly validType = instanceofType(EventTarget);

  constructor(
      readonly target: E,
  ) { }

  simulateClick(options: ClickOptions = {}): ClickEvents {
    const down = new MouseEvent('mousedown', options);
    this.target.dispatchEvent(down);
    const up = new MouseEvent('mouseup', options);
    this.target.dispatchEvent(up);
    const click = new MouseEvent('click', options);
    this.target.dispatchEvent(click);
    return {down, up, click};
  }

  simulateKeydown(key: string, options: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {key, ...options});
    this.target.dispatchEvent(event);
    return event;
  }

  simulateMouseMove(options: MouseEventInit = {}): MouseEvent {
    const event = new MouseEvent('mousemove', options);
    this.target.dispatchEvent(event);
    return event;
  }
}