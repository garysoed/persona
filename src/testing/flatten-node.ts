import {$asArray, $asMap, $filterNonNull, $last, $map, $pipe, $scan, arrayFrom} from 'gs-tools/export/collect';

export function flattenNode<N extends Node>(origNode: N): N {
  return flattenNodeWithShadow(origNode, new Map());
}

function flattenNodeWithShadow<N extends Node>(origNode: N, ancestorSlotMap: ReadonlyMap<string, Node>): N;
function flattenNodeWithShadow(origNode: Node, ancestorSlotMap: ReadonlyMap<string, Node>): Node {
  if (origNode instanceof Element && origNode.tagName === 'SLOT') {
    const slotName = origNode.getAttribute('name') ?? '';
    const slotEl = origNode.cloneNode();
    const slotContentEl = ancestorSlotMap.get(slotName);
    if (slotContentEl) {
      slotEl.appendChild(slotContentEl);
      return slotEl;
    }
  }

  const shadowRoot = origNode instanceof Element ? origNode.shadowRoot : null;
  const rootEl = origNode.cloneNode();
  if (shadowRoot === null) {
    const children = $pipe(
        arrayFrom(origNode.childNodes),
        $map(child => flattenNodeWithShadow(child, ancestorSlotMap)),
        $asArray(),
    );
    for (const child of children) {
      rootEl.appendChild(child);
    }
    return rootEl;
  }

  const slotMapRaw = $pipe(
      arrayFrom(origNode.childNodes),
      $map(child => {
        if (child instanceof Text) {
          return ['', child] as const;
        }

        if (!(child instanceof Element)) {
          return null;
        }

        const slotName = child.getAttribute('slot') ?? '';
        return [slotName ?? '', flattenNodeWithShadow(child, ancestorSlotMap)] as const;
      }),
      $filterNonNull(),
      $scan((acc, [key, value]) => {
        const existingNodes = acc.get(key);
        if (existingNodes) {
          return new Map([
            ...acc,
            [key, [...existingNodes, value]],
          ]);
        }

        return new Map([...acc, [key, [value]]]);
      }, new Map<string, readonly Node[]>()),
      $asArray(),
      $last(),
  ) ?? new Map<string, readonly Node[]>();

  const slotMap = $pipe(
      slotMapRaw,
      $map(([key, nodes]) => {
        const fragment = document.createDocumentFragment();
        fragment.append(...nodes);
        return [key, fragment] as const;
      }),
      $asMap(),
  );

  // Add shadowRoot's children
  const children = $pipe(
      arrayFrom(shadowRoot.childNodes),
      $map(child => flattenNodeWithShadow(child, slotMap)),
      $asArray(),
  );
  for (const child of children) {
    rootEl.appendChild(child);
  }
  return rootEl;
}

