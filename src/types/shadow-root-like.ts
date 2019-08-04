export interface ShadowRootLike extends Node {
  host: Element;
  getElementById(id: string): Element|null;
}
