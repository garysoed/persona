const __rect = Symbol('rect');

type SpiedElement = Element & {[__rect]?: DOMRect};

function fakeGetBoundingClientRect(
  origGetBoundingClientRect: () => DOMRect,
): () => DOMRect {
  return function (this: SpiedElement): DOMRect {
    const rect = this[__rect];
    if (rect) {
      return rect;
    }

    return origGetBoundingClientRect.call(this);
  };
}

export function setBoundingClientRect(
  element: SpiedElement,
  rect: DOMRect,
): void {
  element[__rect] = rect;
}

export function installFakeRect(): () => void {
  const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = fakeGetBoundingClientRect(
    origGetBoundingClientRect,
  );

  return () => {
    Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
  };
}
