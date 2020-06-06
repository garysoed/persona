import { Vine } from 'grapevine';
import { of as observableOf } from 'rxjs';

import { BaseElementTester } from './base-element-tester';


export class ElementTester<T extends HTMLElement = HTMLElement> extends BaseElementTester<T> {
  constructor(
      readonly element: T,
      readonly vine: Vine,
  ) {
    super(observableOf(element), vine);
  }
}
