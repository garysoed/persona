import {Type} from 'gs-types';

export interface Harness<E> {
  readonly target: E;
}

export type HarnessCtor<E extends Element, H extends Harness<E>> = {
  new (element: E, hostElement: Element): H;

  readonly validType: Type<E>;
}