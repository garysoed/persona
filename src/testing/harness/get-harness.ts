import {hasPropertiesType, instanceofType, intersectType, stringType, Type} from 'gs-types';

import {Harness, HarnessCtor} from './harness';

const HARNESS_CTOR: Type<HarnessCtor<Element, Harness<Element>>> = intersectType([
  instanceofType(Function),
  hasPropertiesType({validType: instanceofType(Object)}),
]);

export function getHarness<E extends Element, H extends Harness<E>>(
  hostElement: E,
  harnessCtor: HarnessCtor<E, H>,
): H;
export function getHarness<E extends Element, H extends Harness<E>>(
    hostElement: Element,
    selector: string,
    harnessCtor: HarnessCtor<E, H>,
): H;
export function getHarness(
    hostElement: Element,
    selectorOrHarnessCtor: string|HarnessCtor<Element, Harness<Element>>,
    harnessCtor?: HarnessCtor<Element, Harness<Element>>,
): Harness<Element> {
  const element = stringType.check(selectorOrHarnessCtor)
    ? hostElement.shadowRoot?.querySelector(selectorOrHarnessCtor)
    : hostElement;

  const ctor: HarnessCtor<Element, Harness<Element>>|null = harnessCtor
      ?? (HARNESS_CTOR.check(selectorOrHarnessCtor) ? selectorOrHarnessCtor : null);
  if (!ctor) {
    throw new Error('harnessCtor not found');
  }

  const validType: Type<Element> = ctor.validType;
  validType.assert(element);

  return new ctor(element, hostElement);
}