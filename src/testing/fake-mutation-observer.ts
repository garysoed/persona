import { fake, spy } from '@gs-testing';

class FakeMutationObserver extends MutationObserver {
  constructor(private readonly callback: MutationCallback) {
    super(callback);
  }

  observe(target: Node): void {
    target.addEventListener('mk-fake-mutation', event => {
      this.callback([(event as CustomEvent).detail.record], this);
    });
  }
}

function createFakeNodeList(nodes: Node[]): NodeList {
  // tslint:disable-next-line: no-object-literal-type-assertion
  const nodeList = {
    forEach: (callbackFn: (value: Node, key: number, parent: NodeList) => void) => {
      nodes.forEach((node, index) => callbackFn(node, index, nodeList));
    },
    item: (index: number) => {
      return nodes[index] || null;
    },
    length: nodes.length,
  } as NodeList;

  return nodeList as NodeList;
}

export function installFakeMutationObserver(): () => void {
  const origMutationObserver = globalThis.MutationObserver;
  globalThis.MutationObserver = FakeMutationObserver;

  const origSetAttribute = HTMLElement.prototype.setAttribute;
  fake(spy(HTMLElement.prototype, 'setAttribute'))
      .always()
      .call(function(this: HTMLElement, attributeName: string, value: string): void {
        const oldValue = this.getAttribute(attributeName);
        origSetAttribute.call(this, attributeName, value);
        const record = {
          attributeName,
          oldValue,
        };
        this.dispatchEvent(new CustomEvent('mk-fake-mutation', {detail: {record}}));
      });

  const origRemoveAttribute = HTMLElement.prototype.removeAttribute;
  fake(spy(HTMLElement.prototype, 'removeAttribute'))
      .always()
      .call(function(this: HTMLElement, attributeName: string): void {
        const oldValue = this.getAttribute(attributeName);
        origRemoveAttribute.call(this, attributeName);
        const record = {
          attributeName,
          oldValue,
        };
        this.dispatchEvent(new CustomEvent('mk-fake-mutation', {detail: {record}}));
      });

  const origAppendChild = Node.prototype.appendChild;
  fake(spy(Node.prototype, 'appendChild'))
      .always()
      .call(function(this: Node, node: Node): Node {
        const newNode = origAppendChild.call(this, node);
        const record = {
          addedNodes: createFakeNodeList([node]),
          removedNodes: createFakeNodeList([]),
        };
        this.dispatchEvent(new CustomEvent('mk-fake-mutation', {detail: {record}}));

        return newNode;
      });


  const origRemoveChild = Node.prototype.removeChild;
  fake(spy(Node.prototype, 'removeChild'))
      .always()
      .call(function(this: Node, node: Node): Node {
        const newNode = origRemoveChild.call(this, node);
        const record = {
          addedNodes: createFakeNodeList([]),
          removedNodes: createFakeNodeList([node]),
        };
        this.dispatchEvent(new CustomEvent('mk-fake-mutation', {detail: {record}}));

        return newNode;
      });

  return () => {
    globalThis.MutationObserver = origMutationObserver;
  };
}
