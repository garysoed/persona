export class FakeEventTarget implements EventTarget {
  private readonly innerDom = document.createElement('div');

  addEventListener(
    type: string,
    listener: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    if (listener === null) {
      return;
    }

    this.innerDom.addEventListener(type, listener, options);
  }
  dispatchEvent(event: Event): boolean {
    return this.innerDom.dispatchEvent(event);
  }
  removeEventListener(
    type: string,
    callback: EventListener | EventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined,
  ): void {
    if (callback === null) {
      return;
    }

    this.innerDom.removeEventListener(type, callback, options);
  }
}
