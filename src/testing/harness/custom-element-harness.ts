import {Registration} from '../../types/registration';

import {Harness} from './harness';


type ElementOf<R> = R extends Registration<infer E, any> ? E : never;

export abstract class CustomElementHarness<R extends Registration<HTMLElement, any>>
implements Harness<ElementOf<R>> {
  constructor(
    readonly target: ElementOf<R>,
  ) {}
}
