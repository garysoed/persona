import {Registration} from '../../types/registration';

import {ElementHarness} from './element-harness';

type ElementOf<R> = R extends Registration<infer E, any> ? E : never;

export abstract class CustomElementHarness<R extends Registration<HTMLElement, any>>
  extends ElementHarness<ElementOf<R>> {
}
