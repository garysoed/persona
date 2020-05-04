import { Observable } from 'rxjs';

export interface RenderSpec {
  canReuseElement(element: Element): boolean;

  createElement(): Observable<Element>;

  registerElement(element: Element): Observable<unknown>;
}
