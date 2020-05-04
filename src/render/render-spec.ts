import { Observable } from 'rxjs';

export interface RenderSpec {
  canReuseElement(element: HTMLElement): boolean;

  createElement(): Observable<HTMLElement>;

  registerElement(element: HTMLElement): Observable<unknown>;
}
