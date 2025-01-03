import {fake, spy} from 'gs-testing';
import {getOrigFn} from 'gs-testing/src/spy/spy';

const FAKE_MUTATION_EVENT = 'pr-fake-mutation';

class FakeMutationObserver extends MutationObserver {
  constructor(private readonly callback: MutationCallback) {
    super(callback);
  }

  override observe(target: Node, options: MutationObserverInit): void {
    target.addEventListener(FAKE_MUTATION_EVENT, (event) => {
      if (!options.subtree && event.target !== target) {
        return;
      }

      const record: MutationRecord = (event as CustomEvent).detail.record;
      if (record.attributeName) {
        // This is an attribute change event.
        if (!options.attributes) {
          return;
        }

        if (
          options.attributeFilter &&
          !new Set(options.attributeFilter).has(record.attributeName)
        ) {
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
  const nodeList = {
    forEach: (
      callbackFn: (value: Node, key: number, parent: NodeList) => void,
    ) => {
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
    .call(function (
      this: HTMLElement,
      attributeName: string,
      value: string,
    ): void {
      const oldValue = this.getAttribute(attributeName);
      origSetAttribute.call(this, attributeName, value);
      const record = {
        attributeName,
        oldValue,
      };
      triggerFakeMutation(this, record);
    });

  const origRemoveAttribute = HTMLElement.prototype.removeAttribute;
  fake(spy(HTMLElement.prototype, 'removeAttribute'))
    .always()
    .call(function (this: HTMLElement, attributeName: string): void {
      const oldValue = this.getAttribute(attributeName);
      origRemoveAttribute.call(this, attributeName);
      const record = {
        attributeName,
        oldValue,
      };
      triggerFakeMutation(this, record);
    });

  const spyAppendChild = spy(Node.prototype, 'appendChild');
  fake(spyAppendChild)
    .always()
    .call(function (this: Node, node: Node): Node {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const origFn = getOrigFn(spyAppendChild)!;
      const newNode = origFn.call(this, node);
      const record = {
        addedNodes: createFakeNodeList([node]),
        removedNodes: createFakeNodeList([]),
      };
      triggerFakeMutation(this, record);

      return newNode;
    });

  const spyInsertBefore = spy(Node.prototype, 'insertBefore');
  fake(spyInsertBefore)
    .always()
    .call(function (this: Node, node: Node, refChild: Node | null): Node {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newNode = getOrigFn(spyInsertBefore)!.call(this, node, refChild);
      const record = {
        addedNodes: createFakeNodeList([node]),
        removedNodes: createFakeNodeList([]),
      };
      triggerFakeMutation(this, record);

      return newNode;
    });

  const origRemoveChild = Node.prototype.removeChild;
  fake(spy(Node.prototype, 'removeChild'))
    .always()
    .call(function (this: Node, node: Node): Node {
      const newNode = origRemoveChild.call(this, node);
      const record = {
        addedNodes: createFakeNodeList([]),
        removedNodes: createFakeNodeList([node]),
      };
      triggerFakeMutation(this, record);

      return newNode;
    });

  return () => {
    globalThis.MutationObserver = origMutationObserver;
  };
}

export function triggerFakeMutation(element: Node, record: {}): void {
  element.dispatchEvent(
    new CustomEvent(FAKE_MUTATION_EVENT, {bubbles: true, detail: {record}}),
  );
}
