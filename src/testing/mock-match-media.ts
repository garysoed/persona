import { fake, spy } from 'gs-testing/export/spy';

export class FakeMediaQuery extends EventTarget implements MediaQueryList {
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any)|null = null;
  private readonly eventTarget: EventTarget = document.createElement('div');
  private matches_: boolean = false;

  constructor(
      readonly media: string,
  ) {
    super();
  }

  addEventListener(
      type: string,
      listener: EventListener|EventListenerObject|null,
      options?: boolean|AddEventListenerOptions|undefined,
  ): void {
    this.eventTarget.addEventListener(type, listener, options);
  }

  addListener(listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null): void {
    throw new Error('Deprecated');
  }

  dispatchEvent(event: Event): boolean {
    return this.eventTarget.dispatchEvent(event);
  }

  get matches(): boolean {
    return this.matches_;
  }
  set matches(newValue: boolean) {
    this.matches_ = newValue;

    const event = new FakeMediaQueryListEvent(newValue, this.media, 'change');
    if (this.onchange) {
      this.onchange(event);
    }
    this.eventTarget.dispatchEvent(event);
  }

  removeEventListener(
      type: string,
      listener: EventListener|EventListenerObject|null,
      options?: boolean|AddEventListenerOptions|undefined,
  ): void {
    this.eventTarget.removeEventListener(type, listener, options);
  }

  removeListener(listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null): void {
    throw new Error('Deprecated');
  }
}

class FakeMediaQueryListEvent extends CustomEvent<void> implements MediaQueryListEvent {
  constructor(
      readonly matches: boolean,
      readonly media: string,
      type: string,
  ) {
    super(type);
  }
}

export function mockMatchMedia(window: Window): void {
  const testerMap = new Map<string, FakeMediaQuery>();
  fake(spy(window, 'matchMedia')).always().call(query => {
    const mediaQuery = testerMap.get(query) || new FakeMediaQuery(query);
    testerMap.set(query, mediaQuery);

    return mediaQuery as any;
  });
}
