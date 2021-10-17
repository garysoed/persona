import {fake, spy} from 'gs-testing';

class FakeMutationObserver extends MutationObserver {
  constructor(private readonly callback: MutationCallback) {
    super(callback);
  }

  observe(target: Node, options: MutationObserverInit): void {
    target.addEventListener('pr-fake-mutation', event => {
      if (!options.subtree && event.target !== target) {
        return;
      }

      const record: MutationRecord = (event as CustomEvent).detail.record;
      if (record.attributeName) {
        // This is an attribute change event.
        if (!options.attributes) {
          return;
        }

        if (options.attributeFilter
            && !(new Set(options.attributeFilter)).has(record.attributeName)) {
          return;
        }
      }

      if (record.addedNodes || record.removedNodes) {
        if (!options.childList) {
          return;
        }
      }
      this.callback([record], this);
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
        this.dispatchEvent(new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record}}));
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
        this.dispatchEvent(new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record}}));
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
        this.dispatchEvent(new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record}}));

        return newNode;
      });

  const origInsertBefore = Node.prototype.insertBefore;
  fake(spy(Node.prototype, 'insertBefore'))
      .always()
      .call(function(this: Node, node: Node, refChild: Node|null): Node {
        const newNode = origInsertBefore.call(this, node, refChild);
        const record = {
          addedNodes: createFakeNodeList([node]),
          removedNodes: createFakeNodeList([]),
        };
        this.dispatchEvent(new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record}}));

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
        this.dispatchEvent(new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record}}));

        return newNode;
      });

  return () => {
    globalThis.MutationObserver = origMutationObserver;
  };
}
