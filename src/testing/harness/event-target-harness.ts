import {instanceofType} from 'gs-types';

import {Harness} from './harness';

type ClickOptions = MouseEventInit;

interface ClickEvents {
  readonly click: MouseEvent;
  readonly down: MouseEvent;
  readonly up: MouseEvent;
}

export class EventTargetHarness<E extends EventTarget> implements Harness<E> {
  static readonly validType = instanceofType(EventTarget);

  constructor(readonly target: E) {}

  simulateClick(options: ClickOptions = {}): ClickEvents {
    const down = new MouseEvent('mousedown', {composed: true, ...options});
    this.target.dispatchEvent(down);
    const up = new MouseEvent('mouseup', {composed: true, ...options});
    this.target.dispatchEvent(up);
    const click = new MouseEvent('click', {composed: true, ...options});
    this.target.dispatchEvent(click);
    return {click, down, up};
  }
  simulateKeydown(
    key: string,
    options: KeyboardEventInit = {composed: true},
  ): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      composed: true,
      key,
      ...options,
    });
    this.target.dispatchEvent(event);
    return event;
  }
  simulateMouseMove(options: MouseEventInit = {composed: true}): MouseEvent {
    const event = new MouseEvent('mousemove', {composed: true, ...options});
    this.target.dispatchEvent(event);
    return event;
  }
}
