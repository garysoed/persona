import {Harness, HarnessCtor} from './harness';

export function getHarness<E extends Element, H extends Harness<E>>(
    hostElement: Element,
    selector: string,
    harnessCtor: HarnessCtor<E, H>,
): H {
  const element = hostElement.shadowRoot?.querySelector(selector);
  harnessCtor.validType.assert(element);

  return new harnessCtor(element, hostElement);
}