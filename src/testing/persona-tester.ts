import {Vine, Config as VineConfig} from 'grapevine';
import {fake, FakeTime, mockTime, runEnvironment, spy} from 'gs-testing';

import {BaseCtrlCtor} from '../core/base-ctrl';
import {Builder as PersonaBuilder} from '../core/builder';
import {MediaQueryInput} from '../input/media-query';
import {CustomElementCtrlCtor} from '../types/custom-element-ctrl';

import {ElementTester} from './element-tester';
import {FakeCustomElementRegistry} from './fake-custom-element-registry';
import {FakeMediaQuery, mockMatchMedia} from './mock-match-media';
import {PersonaTesterEnvironment} from './persona-tester-environment';

interface Config {
  readonly rootCtrls?: ReadonlyArray<CustomElementCtrlCtor|BaseCtrlCtor>;
  readonly rootDoc: Document;
  readonly overrides?: VineConfig['overrides'];
}


// TODO: Should only use the API, not the private $
// TODO: Add snapshot getter
/**
 * Used to test UI implemented using Persona.
 */
export class PersonaTester {
  constructor(
      readonly fakeTime: FakeTime,
      readonly vine: Vine,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  createElement<T extends HTMLElement>(tag: string): ElementTester<T> {
    const element = this.customElementRegistry.create(tag) as T;

    return new ElementTester(element, this.vine);
  }

  setMedia(input: MediaQueryInput, value: boolean): void {
    const mediaQuery = window.matchMedia(input.query);
    if (!(mediaQuery instanceof FakeMediaQuery)) {
      throw new Error(`mediaQuery should be a ${FakeMediaQuery} but was ${mediaQuery}`);
    }

    (mediaQuery as FakeMediaQuery).matches = value;
  }
}

/**
 * Test UI elements built by Persona.
 *
 * Instantiate the factory once. You will need to call build at the beginning of every test.
 */
export class PersonaTesterFactory {
  constructor(
      private readonly personaBuilder: PersonaBuilder,
  ) { }

  build(config: Config): PersonaTester {
    const origCreateElement = document.createElement;
    function createElement(tag: string): HTMLElement {
      return origCreateElement.call(document, tag);
    }
    const fakeTime = mockTime(window);
    const customElementRegistry = new FakeCustomElementRegistry(createElement, fakeTime);
    const vine = new Vine({appName: 'test', overrides: config.overrides});

    this.personaBuilder.build({
      customElementRegistry,
      rootCtrls: [],
      vine,
      ...config,
    });

    const tester = new PersonaTester(fakeTime, vine, customElementRegistry);
    fake(spy(document, 'createElement'))
        .always().call(tag => {
          if (customElementRegistry.get(tag)) {
            const elTester = tester.createElement(tag);

            return elTester.element;
          } else {
            return createElement(tag);
          }
        });
    mockMatchMedia(window);
    runEnvironment(new PersonaTesterEnvironment());

    return tester;
  }
}
