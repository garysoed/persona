import { fake, spy } from '@gs-testing';

class FakeMutationObserver extends MutationObserver {
  constructor(private readonly callback: MutationCallback) {
    super(callback);
  }

  observe(target: Node): void {
    target.addEventListener('mk-fake-mutation', () => {
      this.callback([], this);
    });
  }
}

export function installFakeMutationObserver(): () => void {
  const origMutationObserver = globalThis.MutationObserver;
  globalThis.MutationObserver = FakeMutationObserver;

  const origSetAttribute = HTMLElement.prototype.setAttribute;
  fake(spy(HTMLElement.prototype, 'setAttribute'))
      .always()
      // tslint:disable-next-line: typedef
      .call(function(this: HTMLElement, tag, value) {
        origSetAttribute.call(this, tag, value);
        this.dispatchEvent(new CustomEvent('mk-fake-mutation'));
      });

  const origRemoveAttribute = HTMLElement.prototype.removeAttribute;
  fake(spy(HTMLElement.prototype, 'removeAttribute'))
      .always()
      // tslint:disable-next-line: typedef
      .call(function(this: HTMLElement, tag) {
        origRemoveAttribute.call(this, tag);
        this.dispatchEvent(new CustomEvent('mk-fake-mutation'));
      });

  return () => {
    globalThis.MutationObserver = origMutationObserver;
  };
}
