export interface Renderer<T, N> {
  render(currentValue: T, existingRender: N|null, parentNode: Node, insertionPoint: Node|null): N;
}
