const TEST_URL_BASE = 'https://testbase';

export class FakeLocation implements Location {
  private url: URL|null = null;

  get ancestorOrigins(): DOMStringList {
    throw new Error('Method not implemented.');
  }

  assign(url: string): void {
    this.url = new URL(url, TEST_URL_BASE);
  }

  get hash(): string {
    if (!this.url) {
      return '';
    }

    return this.url.hash;
  }

  get host(): string {
    if (!this.url) {
      return '';
    }

    return this.url.host;
  }

  get hostname(): string {
    if (!this.url) {
      return '';
    }

    return this.url.hostname;
  }

  get href(): string {
    if (!this.url) {
      return '';
    }

    return this.url.href;
  }

  get origin(): string {
    if (!this.url) {
      return '';
    }

    return this.url.origin;
  }

  get pathname(): string {
    if (!this.url) {
      return '';
    }

    return this.url.pathname;
  }

  get port(): string {
    if (!this.url) {
      return '';
    }

    return this.url.port;
  }

  get protocol(): string {
    if (!this.url) {
      return '';
    }

    return this.url.protocol;
  }

  reload(forcedReload?: boolean): void {
    throw new Error('Method not implemented.');
  }

  replace(url: string): void {
    throw new Error('Method not implemented.');
  }

  get search(): string {
    if (!this.url) {
      return '';
    }

    return this.url.search;
  }
}
