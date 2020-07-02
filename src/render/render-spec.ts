import { Observable } from 'rxjs';

export interface RenderSpec {
  canReuseNode(node: Node): boolean;

  createNode(): Observable<Node>;

  registerNode(node: Node): Observable<unknown>;
}
