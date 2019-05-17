import { FakeEventTarget } from './fake-event-target';

interface HistoryData {
  data: any;
  title: string;
  url?: string|null;
}

export class FakeHistory implements History {
  scrollRestoration: ScrollRestoration = 'auto';

  private readonly historyData: HistoryData[] = [];
  private index = -1;
  private readonly setUrl: (url: string|null|undefined) => void;

  constructor(
      private readonly window: FakeEventTarget,
      urlChangeHandler: (url: string) => void,
  ) {
    this.setUrl = (url: string|null|undefined) => {
      if (url) {
        urlChangeHandler(url);
      }
    };
  }

  back(): void {
    this.go(-1);
  }

  forward(): void {
    this.go(1);
  }

  get length(): number {
    return this.historyData.length;
  }

  go(delta?: number|undefined): void {
    const change = delta || 0;
    this.index += delta || 0;
    if (change !== 0) {
      this.window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  pushState(data: any, title: string, url?: string|null|undefined): void {
    this.historyData.splice(this.index, this.length - this.index, {data, title, url});

    this.setUrl(url);
  }

  replaceState(data: any, title: string, url?: string|null|undefined): void {
    this.historyData[this.index] = {data, title, url};

    this.setUrl(url);
  }

  get state(): any {
    const data = this.historyData[this.index];

    return data ? data.data : undefined;
  }
}
