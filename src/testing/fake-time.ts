import { fake, spy } from '@gs-testing';

interface ScheduledHandler {
  scheduledTimestamp: number;
  handler(): unknown;
}

export class FakeTime {
  private id = 0;
  private nowValue = 0;
  private readonly scheduledHandlers = new Map<number, ScheduledHandler>();

  install(window: Window): void {
    fake(spy(window, 'setInterval'))
        .always()
        .call((handler, delayMs, ...args) => this.setInterval(handler, delayMs, args));
    fake(spy(window, 'setTimeout'))
        .always()
        .call((handler, delayMs, ...args) => this.setTimeout(handler, delayMs, args));
    fake(spy(Date, 'now')).always().call(() => this.nowValue);
  }

  tick(timeMs: number): void {
    this.nowValue += timeMs;
    this.checkScheduled();
  }

  private checkScheduled(): void {
    for (const [id, handler] of this.scheduledHandlers) {
      if (handler.scheduledTimestamp <= this.nowValue) {
        handler.handler();
        this.clear(id);
      }
    }
  }

  private clear(id: number): void {
    this.scheduledHandlers.delete(id);
  }

  private schedule(id: number, handler: () => unknown, delayMs: number): void {
    this.scheduledHandlers.set(
        id,
        {handler, scheduledTimestamp: this.nowValue + delayMs},
    );
    this.checkScheduled();
  }

  private setInterval(handler: TimerHandler, delayMs: number|undefined, args: any[]): number {
    if (!(handler instanceof Function)) {
      throw new Error('setInterval only accepts functions');
    }

    const id = this.id++;
    const delay = delayMs || 10;
    const intervalHandler = () => {
      try {
        handler.call(null, ...args);
      } finally {
        this.schedule(id, intervalHandler, delay);
      }
    };
    this.schedule(id, intervalHandler, delay);

    return id;
  }

  private setTimeout(handler: TimerHandler, delayMs: number|undefined, args: any[]): number {
    if (!(handler instanceof Function)) {
      throw new Error('setTimeout only accepts functions');
    }

    const id = this.id++;
    const delay = delayMs || 10;
    this.schedule(id, () => handler.call(null, ...args), delay);

    return id;
  }
}
