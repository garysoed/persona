export const __id = Symbol('renderId');

export interface RenderValue {
  [key: string]: any;
  [__id]: string;
}

export interface Renderer<T extends RenderValue, N extends Node> {
  render(currentValue: T, previousRender: N|null): N|null;
}
