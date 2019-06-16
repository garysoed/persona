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
      .call(function(this: HTMLElement, tag: string, value: string): void {
        origSetAttribute.call(this, tag, value);
        this.dispatchEvent(new CustomEvent('mk-fake-mutation'));
      });

  const origRemoveAttribute = HTMLElement.prototype.removeAttribute;
  fake(spy(HTMLElement.prototype, 'removeAttribute'))
      .always()
      .call(function(this: HTMLElement, tag: string): void {
        origRemoveAttribute.call(this, tag);
        this.dispatchEvent(new CustomEvent('mk-fake-mutation'));
      });

  const origAppendChild = Node.prototype.appendChild;
  fake(spy(Node.prototype, 'appendChild'))
      .always()
      .call(function(this: Node, node: Node): Node {
        const newNode = origAppendChild.call(this, node);
        this.dispatchEvent(new CustomEvent('mk-fake-mutation'));

        return newNode;
      });

  return () => {
    globalThis.MutationObserver = origMutationObserver;
  };
}
