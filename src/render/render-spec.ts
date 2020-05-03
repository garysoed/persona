import { Observable } from 'rxjs';

export interface RenderSpec {
  canReuseElement(element: HTMLElement): boolean;

  createElement(): HTMLElement;

  registerElement(element: HTMLElement): Observable<unknown>;
}
