import {Harness, HarnessCtor} from './harness';

export function getHarness<E extends Element, H extends Harness<E>>(
    hostElement: Element,
    id: string,
    harnessCtor: HarnessCtor<E, H>,
): H {
  const element = hostElement.shadowRoot?.getElementById(id);
  harnessCtor.validType.assert(element);

  return new harnessCtor(element, hostElement);
}