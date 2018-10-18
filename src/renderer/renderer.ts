export interface Renderer<T, N extends Node> {
  render(currentValue: T, previousRender: N|null): N;
}
