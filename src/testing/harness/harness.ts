import {Type} from 'gs-types';

export interface Harness<E extends Element> {
  readonly element: E;
  readonly hostElement: Element;
}

export type HarnessCtor<E extends Element, H extends Harness<E>> = {
  new (element: E, hostElement: Element): H;

  readonly validType: Type<E>;
}